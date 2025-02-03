from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAdminUser,IsAuthenticated
from django.shortcuts import render,redirect
# from django.http import JsonResponse
# from .models import CustomUser
# from .serializers import CustomUserSerializer


class RegistrationView(APIView):
    serializer_class = RegistrationSerializer
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens=user.tokens()
            if user.role in ['hotel_owner', 'activity_lister','event_lister']:
                # Send an email to the admin notifying the registration
                user.is_seller=True
                ADMIN_EMAIL = 'admin@gmail.com'
                send_mail(
                    subject='New Seller Registered',
                    message=f'A new seller has registered. Username: {user.email}, Role: {user.role}. Please review and approve them.',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[ADMIN_EMAIL],
                    fail_silently=False,
                )
            user.save()  
            return Response(
                {
                    "message": "Registration successful. Your registration has been notified to the admin for approval." if user.is_seller else "User registered successfully.",
                    "data": serializer.data,
                    "access": tokens['access'],
                    "refresh": tokens['refresh'],
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class ApproveRejectSellerView(APIView):
#     # permission_classes = [IsAdminUser]

#     def patch(self, request, user_id,action):
#         try:
#             user = CustomUser.objects.get(id=user_id)  # Fetch the user by ID
#         except CustomUser.DoesNotExist:
#             return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

#         # Check if the user is a seller and has the correct role
#         if user.role not in ['hotel_owner', 'activity_lister']:
#             return Response({"error": "This user is not a seller."}, status=status.HTTP_400_BAD_REQUEST)

#         # Get the approval status from the request data
#         # is_approved = request.data.get("is_approved", None)

#         # if is_approved is None:
#         #     return Response({"error": "Approval status is required."}, status=status.HTTP_400_BAD_REQUEST)
        
#         # if is_approved not in ['approved', 'rejected', 'pending']:
#         #     return Response({"error": "Invalid approval status."}, status=status.HTTP_400_BAD_REQUEST)

#         # Update the is_approved status
#         if action == 'approve':
#             user.is_approved = 'approved'
#         elif action == 'reject':
#             user.is_approved = 'rejected'
#         # user.is_approved = is_approved
#         user.save()

#         # Send an email notification to the seller about the approval/rejection
#         status_message = f"Your registration has been {user.is_approved}."
#         send_mail(
#             subject="Seller Approval Status",
#             message=status_message,
#             from_email=settings.EMAIL_HOST_USER,
#             recipient_list=[user.email],
#             fail_silently=False,
#         )

#         # Return appropriate response
#         return Response(
#             {"message": f"Seller has been {user.is_approved}."},
#             status=status.HTTP_200_OK
#         )
def Approve(request,user_id):
    users=CustomUser.objects.get(id=user_id)
    users.is_approved='approved'
    users.save()
    status_message = f"Your registration has been approved."
    send_mail(
            subject="Seller Approval Status",
            message=status_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[users.email],
            fail_silently=False,
        )
    return redirect('/users')


def Reject(request,user_id):
    users=CustomUser.objects.get(id=user_id)
    users.is_approved='rejected'
    users.save()
    status_message = f"Your registration has been rejected."
    send_mail(
            subject="Seller Approval Status",
            message=status_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[users.email],
            fail_silently=False,
        )
    return redirect('/users')

class LoginView(APIView):
    serializer_class = LoginSerializer
    def post(self,request,*args,**kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                user = CustomUser.objects.get(email=email) 
                # Check if user is approved
                if user.is_approved != 'approved':
                    return Response({'error': 'You are not approved by the admin'}, status=status.HTTP_403_FORBIDDEN)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Invalid email credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if user.check_password(password):  
                refresh = RefreshToken.for_user(user)
                if user.is_staff:
                    message="Admin login successful"
                elif user.is_seller:
                    if user.role=='event_lister':
                        message="Event_Lister login successful"
                    elif user.role=='hotel_owner':
                        message="Hotel_owner login successful"
                    elif user.role=='activity_lister':
                        message="Activity_Lister login successful"
                    else:
                        message="Seller login successfu;"
                else:
                    message="User login successful"
                return Response({
                    'message':message,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            else:
                return Response({'error': 'You are not verified. Please verify your email'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'Invalid password credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class ForgotPasswordView(APIView):
    serializer_class = ForgotPasswordSerializer
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = CustomUser.objects.get(email=email)
                token = AccessToken.for_user(user)  
                reset_link = f"http://localhost:3000/reset-password/{token}"  

                send_mail(
                    subject='Password Reset Request',
                    message=f'Please use the following link to reset your password: {reset_link}',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

                return Response({"message": "Password reset link has been sent to your email."}, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response({"message": "If an account with this email exists, a password reset link has been sent."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetView(APIView):
    serializer_class = ResetPasswordSerializer

    def post(self,request,token):
        try:
            payload = AccessToken(token)
            user = CustomUser.objects.get(id=payload['user_id'])

            serializer = ResetPasswordSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                new_password=data['new_password']
                user.set_password(new_password)
                user.save()
                return Response({'success':'Password updated successfully'},status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except (CustomUser.DoesNotExist):
            return Response({"error": "Invalid token or user."}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        

def index(request):
    #fetch data from the table
    users=CustomUser.objects.all()
    context={
        'users':users
    }
    return render(request,'users/user.html',context)


class UserEmail(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            
            # Get user from token
            user = token.user
            
            # Return user's email
            return Response(
                {"message": "your email is", "email": user.email}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )