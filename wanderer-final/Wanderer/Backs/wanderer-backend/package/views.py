from rest_framework import generics, status,serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser,IsAuthenticatedOrReadOnly
from .models import Hotel, Activity, Package, Review
from .serializers import HotelSerializer, ActivitySerializer, PackageSerializer, ReviewSerializer,UserCustomizedPackageSerializer
from django.contrib.auth.decorators import login_required
from .forms import *
from users.auth import admin_only
from django.shortcuts import render,redirect
from django.contrib import messages
from rest_framework.views import APIView
from .filters import PackageFilter
from rest_framework.filters import SearchFilter,OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.http import Http404
from django.db import transaction
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404


class PackagePagination(PageNumberPagination):
    page_size = 4  # Number of items per page
    page_size_query_param = 'page_size'  # Allow clients to set the page size via query parameter
    max_page_size = 100  # Set a maximum limit for page size

# Hotel Views
class HotelListCreateView(generics.ListCreateAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    # permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        # Automatically set the requesting user as the hotel owner
        serializer.save(owner=self.request.user)

class UserHotelListAPIView(APIView):
    def get(self, request):
        # Fetch events only for the logged-in user
        hotel = Hotel.objects.filter(owner=request.user)
    
        serializer = ActivitySerializer(hotel, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class HotelDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Hotel.objects.get(pk=pk, owner=user)  # Ensure the hotel belongs to the logged-in user
        except Hotel.DoesNotExist:
            return None

    def patch(self, request, pk, *args, **kwargs):
        hotel = self.get_object(pk, request.user)
        if not hotel:
            return Response({"error": "Hotel not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        serializer = HotelSerializer(hotel, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        hotel = self.get_object(pk, request.user)
        if not hotel:
            return Response({"error": "Hotel not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        hotel.delete()
        return Response({"message": "Hotel deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# Activity Views
class ActivityListCreateView(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the requesting user as the hotel owner
        serializer.save(owner=self.request.user)

class UserActivityListAPIView(APIView):
    def get(self, request):
        # Fetch events only for the logged-in user
        activity = Activity.objects.filter(owner=request.user)
    
        serializer = ActivitySerializer(activity, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ActivityDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Activity.objects.get(pk=pk, owner=user)  # Ensure the hotel belongs to the logged-in user
        except Activity.DoesNotExist:
            return None

    def patch(self, request, pk, *args, **kwargs):
        activity = self.get_object(pk, request.user)
        if not activity:
            return Response({"error": "activity not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActivitySerializer(activity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        activity = self.get_object(pk, request.user)
        if not activity:
            return Response({"error": "activity not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        activity.delete()
        return Response({"message": "activity deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# Package Views
class PackageListView(generics.ListAPIView):
    queryset = Package.objects.filter(availability=True)
    serializer_class = PackageSerializer
    filter_backends = [SearchFilter,OrderingFilter,DjangoFilterBackend]
    filterset_class=PackageFilter
    search_fields = ['location','duration','id'] 
    # ordering_fields = ['price']  # Define fields for ordering
    # ordering = ['price']  # Default ordering if none specified
    # pagination_class = PackagePagination


class PackageDetailView(generics.RetrieveAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer


class CreatePackageView(generics.CreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminUser]


class PackageDetailAPIView(APIView):
    """
    This view handles POST requests to fetch a package by its ID.
    """

    def post(self, request, *args, **kwargs):
        package_id = request.data.get('package_id')  # Expecting 'package_id' in the POST body
        if not package_id:
            return Response({'error': 'Package ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the package or return 404 if not found
        package = get_object_or_404(Package, id=package_id, availability=True)
        serializer = PackageSerializer(package)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Review Views
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        package_id = self.kwargs['package_id']
        return Review.objects.filter(package_id=package_id)

    def perform_create(self, serializer):
        package = Package.objects.get(id=self.kwargs['package_id'])
        serializer.save(package=package, user=self.request.user)

@login_required
@admin_only
def index(request):
    #fetch data from the table
    packages=Package.objects.all()
    context={
        'packages':packages
    }
    return render(request,'packages/package.html',context)

@login_required
@admin_only
def index_r(request):
    #fetch data from the table
    reviews = Review.objects.select_related('package', 'user').all() 
    context={
        'reviews':reviews
    }
    return render(request,'packages/reviews.html',context)

@login_required
@admin_only
def delete_review(request,review_id):
    review=Review.objects.get(id=review_id)
    review.delete()
    messages.add_message(request,messages.SUCCESS,'Review deleted.')
    return redirect('/package/reviews')


@login_required
@admin_only
def post_package(request):
    if request.method=="POST":
        form=PackageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.add_message(request,messages.SUCCESS,'Package added successfully.')
            return redirect('/package/addPackage')
        else:
            messages.add_message(request,messages.ERROR,'failed to add Package.')
            return render(request,'/packages/addPackage.html',{'form':form})
    context={
        'form':PackageForm
    }
    return render(request,'packages/addPackage.html',context)

@login_required
@admin_only
def update_package(request,Package_id):
    instance=Package.objects.get(id=Package_id)

    if request.method=="POST":
        form=PackageForm(request.POST, request.FILES,instance=instance)
        if form.is_valid():
            form.save()
            messages.add_message(request,messages.SUCCESS,'Package updated successfully.')
            return redirect('/package/')
        else:
            messages.add_message(request,messages.ERROR,'failed to update Package.')
            return render(request,'/packages/updatePackage.html',{'form':form})
    context={
        'form':PackageForm(instance=instance)
    }
    return render(request,'packages/updatePackage.html',context)

@login_required
@admin_only
def delete_package(request,Package_id):
    package=Package.objects.get(id=Package_id)
    package.delete()
    messages.add_message(request,messages.SUCCESS,'Packages deleted.')
    return redirect('/package')


class PackageReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow read-only for non-authenticated users

    def get_queryset(self):
        package = self.kwargs['package_id']
        return Review.objects.filter(package_id=package)

    def perform_create(self, serializer):
        # package = self.kwargs['package_id']
        package = Package.objects.get(id=self.kwargs['package_id'])
        # Automatically assign the logged-in user to the review and the package
        serializer.save(user=self.request.user, package_id=package)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Ensure that only the review posted by the logged-in user is editable or deletable
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You are not allowed to edit or delete this review.")
        return obj

    def perform_update(self, serializer):
        # Allow updating the review
        serializer.save()

    def perform_destroy(self, instance):
        # Allow deleting the review
        instance.delete()

# class PackageCustomizationView(generics.UpdateAPIView):
#     queryset = Package.objects.all()
#     serializer_class = PackageCustomizationSerializer
#     permission_classes = [IsAuthenticated]  # Make sure user is authenticated to update

#     def update(self, request, *args, **kwargs):
#         # Allow partial updates (only fields that are provided in the request will be updated)
#         return super().update(request, *args, **kwargs)
    
class AvailableHotelsForPackageView(generics.ListAPIView):
    serializer_class = HotelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Retrieve the package id from the URL and fetch the package
        package_id = self.kwargs['package_id']
        package = Package.objects.get(id=package_id)

        # Return hotels available for this package's location
        return Hotel.objects.filter(location=package.location)
    

class UserCustomizedPackageView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, package_id, user):
        try:
            package = Package.objects.get(id=package_id)
        except Package.DoesNotExist:
            raise Http404("Package not found")

        obj, created = UserCustomizedPackage.objects.get_or_create(
            user=user, package=package
        )
        return obj

    @transaction.atomic
    def patch(self, request, package_id):
        user = request.user
        customized_package = self.get_object(package_id, user)

        # Extract hotel and activity IDs from request
        selected_hotel_ids = request.data.get('hotels', [])
        selected_activity_ids = request.data.get('activities', [])

        # Validate the IDs (Ensure they are integers)
        try:
            selected_hotel_ids = [int(id) for id in selected_hotel_ids]
            selected_activity_ids = [int(id) for id in selected_activity_ids]
        except ValueError:
            return Response({"error": "Invalid hotel or activity IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Save the instance first to ensure it exists
        serializer = UserCustomizedPackageSerializer(customized_package, data=request.data, partial=True)
        if serializer.is_valid():

            # Assign the IDs directly without redundant filtering
            customized_package.hotels = selected_hotel_ids
            customized_package.activities = selected_activity_ids

            package_duration = int(customized_package.package.duration)

            # Handle hotels assignment
            if not selected_hotel_ids:
                hotel_ids = [hotel.id for hotel in customized_package.package.hotels.all()]
                customized_package.hotels = hotel_ids

                # customized_package.hotels.set(customized_package.package.hotels.all())

            # Handle activities assignment (defaulting to package activities if none are provided)
            if not selected_activity_ids:
                # Correct approach using queryset
                activity_ids = [activity.id for activity in customized_package.package.activities.all()]
                customized_package.activities = activity_ids


            # Get the existing hotel and activity prices from the customized package's current selection
            if customized_package.hotels:  # Check if hotels are customized
                existing_hotel_price = sum(Hotel.objects.filter(id__in=customized_package.hotels).values_list('price', flat=True)) * package_duration
            else:
                existing_hotel_price = sum(Hotel.objects.filter(id__in=customized_package.package.hotels.all()).values_list('price', flat=True))*package_duration


            if customized_package.activities:  # Check if hotels are customized
                existing_activity_price = sum(Activity.objects.filter(id__in=customized_package.activities).values_list('price', flat=True))
            else:
                existing_activity_price = sum(Activity.objects.filter(id__in=customized_package.package.activities.all()).values_list('price', flat=True))


            # Recalculate the total price using the provided IDs
            # selected_hotel_price = sum(Hotel.objects.filter(id__in=selected_hotel_ids).values_list('price', flat=True))*package_duration
            # selected_activity_price = sum(Activity.objects.filter(id__in=selected_activity_ids).values_list('price', flat=True))
            # # customized_package.price = customized_package.package.base_price + hotel_price + activity_price

            #  # Calculate the total price based on the selection
            # if selected_hotel_ids and selected_activity_ids:
            #     # Both hotels and activities are selected
            #     new_price = customized_package.package.base_price + selected_hotel_price + selected_activity_price
            # elif selected_hotel_ids and not selected_activity_ids:
            #     # Only hotels are selected
            #     new_price = customized_package.package.base_price + selected_hotel_price + existing_activity_price
            # elif selected_activity_ids and not selected_hotel_ids:
            #     # Only activities are selected
            #     new_price = customized_package.package.base_price + existing_hotel_price + selected_activity_price
            # else:
            #     # No changes (fallback, if nothing is selected)
            #     new_price = customized_package.package.base_price

            new_price = customized_package.package.base_price + existing_hotel_price + existing_activity_price

            customized_package.price=new_price

            # serializer = UserCustomizedPackageSerializer(customized_package)
            customized_package.save()
            return Response(serializer.data)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)