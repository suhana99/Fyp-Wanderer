# from .models import Purchase
import logging
from django.shortcuts import get_object_or_404
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import stripe
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking
from .serializers import BookingSerializer,BookingHistorySerializer
from package.models import Package, Hotel, Activity, PackageHotel
from users.auth import admin_only
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from users.models import CustomUser
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from rest_framework import generics, permissions



stripe.api_key = settings.STRIPE_SECRET_KEY
class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user

        try:
            # Fetch required data from the request
            package_id = data.get('package')
            total_amount = float(data.get('total_amount'))  # Sent from frontend
            number_of_people = int(data.get('number_of_people', 1))

            # Validate inputs
            if not package_id or not total_amount or number_of_people < 1:
                return Response(
                    {'error': 'Invalid input data. Ensure all required fields are provided.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            package = get_object_or_404(Package, id=package_id)


            # Create a Stripe Checkout Session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': int(total_amount * 100),  # Stripe expects amount in cents
                        'product_data': {
                            'name': f'{package.name} Booking',
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'{settings.FRONTEND_URL}/package/{package.id}?status=succeeded&session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.FRONTEND_URL}/booking?status=cancelled',
                metadata={
                    'user_id': user.id,
                    'package_id': package.id,
                    'number_of_people': number_of_people,
                    'booking_date': data.get('booking_date'),
                    'full_name': data.get('fullname'),
                    'phone_number': data.get('phone'),
                    'hotel': data.get('hotel', ''),
                    'activity': data.get('activity', ''),
                }
            )
            return Response({
                'stripe_checkout_url': checkout_session.url,
                'session_id': checkout_session.id,
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        session_id = data.get('session_id')

        if not session_id:
            return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the Stripe checkout session
            checkout_session = stripe.checkout.Session.retrieve(session_id)

            # Verify that payment was successful
            if checkout_session.payment_status == 'paid':
                # Check if a booking with this session_id already exists
                existing_booking = Booking.objects.filter(stripe_checkout_session_id=session_id).first()
                if existing_booking:
                    return Response(
                        {'error': 'Booking already exists', 'booking': BookingSerializer(existing_booking).data},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Extract metadata
                metadata = checkout_session.metadata
                package_id = metadata.get('package_id')
                user_id = metadata.get('user_id')

                # Retrieve user and package
                user = get_object_or_404(CustomUser, id=user_id)
                package = get_object_or_404(Package, id=package_id)

                # Save booking data
                serializer = BookingSerializer(data={
                    'package': package.id,
                    'number_of_people': metadata.get('number_of_people', 1),
                    'booking_date': metadata.get('booking_date'),
                    'full_name': metadata.get('full_name'),
                    'phone_number': metadata.get('phone_number'),
                    'total_amount': checkout_session.amount_total / 100,  # Convert cents to dollars
                    'hotel': metadata.get('hotel', '').split(','),
                    'activity': metadata.get('activity', '').split(','),
                }, context={'request': request})

                if serializer.is_valid():
                    serializer.save(
                        user=user,
                        package=package,
                        status='confirmed',  # Mark as confirmed upon payment success
                        stripe_checkout_session_id=session_id
                    )
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({'error': 'Payment not completed'}, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ListBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(user=user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



@login_required
@admin_only
def booking(request):
    items = Booking.objects.all()
    hotels_mapping = {}  # To store hotels and days booked for each booking
    activities_mapping = {}  # To store activities for each booking

    for item in items:
        package = item.package
        # Fetch hotels and days booked from PackageHotel
        package_hotels = PackageHotel.objects.filter(package=package)
        hotels_mapping[item.id] = [
            f"{package_hotel.hotel.name} - {package_hotel.number_of_days} days"
            for package_hotel in package_hotels
        ]

        # Fetch activities from the package
        activities_mapping[item.id] = [activity.name for activity in package.activities.all()]

    context = {
        'items': items,
        'hotels_mapping': hotels_mapping,
        'activities_mapping': activities_mapping,
    }
    return render(request, 'bookings/bookings.html', context)


class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        seller_id = request.user.id

        # Check if the seller is a hotel owner
        seller_hotel = Hotel.objects.filter(owner=seller_id)
        is_hotel_owner = seller_hotel.exists()

        # Check if the seller is an activity lister
        seller_activities = Activity.objects.filter(owner=seller_id)
        is_activity_lister = seller_activities.exists()

        # Restrict sellers to one role (hotel owner or activity lister)
        if is_hotel_owner and is_activity_lister:
            return Response(
                {"detail": "Sellers can only own hotel or list activities, not both."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Initialize an empty response data
        data = []

        # Fetch data based on the seller's role
        if is_hotel_owner:
            # Fetch bookings related to hotel owned by the seller
            related_packages = Package.objects.filter(hotels__in=seller_hotel).distinct()
            bookings = Booking.objects.filter(package__in=related_packages).select_related('user', 'package')

            # Prepare response data
            data = [
                {
                    'package_name': booking.package.name,
                    'user_full_name': booking.full_name,
                    'user_phone_number': booking.phone_number,
                    'status':booking.status,
                    'booking_date': booking.booking_date,
                    'hotel_names': [hotel.name for hotel in booking.package.hotels.filter(owner=seller_id)],
                    'activity_names': [],  # Empty as the seller is not an activity lister
                }
                for booking in bookings
            ]

        elif is_activity_lister:
            # Fetch bookings related to activities listed by the seller
            related_packages = Package.objects.filter(activities__in=seller_activities).distinct()
            bookings = Booking.objects.filter(package__in=related_packages).select_related('user', 'package')

            # Prepare response data
            data = [
                {
                    'package_name': booking.package.name,
                    'user_full_name': booking.full_name,
                    'status':booking.status,
                    'user_phone_number': booking.phone_number,
                    'booking_date': booking.booking_date,
                    'hotel_names': [],  # Empty as the seller is not a hotel owner
                    'activity_names': [activity.name for activity in booking.package.activities.filter(owner=seller_id)],
                }
                for booking in bookings
            ]

        else:
            # If the seller owns neither hotel nor activities
            return Response(
                {"detail": "No data available. You must own hotel or list activities to see bookings."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return the prepared data
        return Response(data, status=status.HTTP_200_OK)
    
class BookingHistory(generics.ListAPIView):
    serializer_class = BookingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user  # Access the authenticated user from the request
        return Booking.objects.filter(user=user)  # Filter bookings based on the authenticated user
    
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Handle successful payment
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        package_id = metadata.get('package_id')

        try:
            user = CustomUser.objects.get(id=user_id)
            package = Package.objects.get(id=package_id)

            Booking.objects.create(
                user=user,
                package=package,
                full_name=metadata.get('fullname', ''),
                phone_number=metadata.get('phone', ''),
                additional_notes="",
                booking_date=metadata.get('booking_date', ''),
                stripe_checkout_session_id=session['id']
            )
        except Exception as e:
            # Handle booking creation errors
            pass

    return JsonResponse({'status': 'success'}, status=200)