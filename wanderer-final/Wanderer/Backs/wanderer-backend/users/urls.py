from django.urls import path
from .views import *


urlpatterns = [
        path('register/',RegistrationView.as_view(),name='registration'),
        # path('approve-reject-seller/<int:user_id>/', ApproveRejectSellerView.as_view(), name='approve-reject-seller'),
        # path('approve_user/',ApproveRejectSellerView.as_view()),
        path('sellers/approve/<int:user_id>/', Approve, name='approve_seller'),
        path('sellers/reject/<int:user_id>/', Reject, name='reject_seller'),
        path('login/',LoginView.as_view(),name='login'),
        path('logout/',LogoutView.as_view(),name='logout'),
        path('forgot-password/',ForgotPasswordView.as_view(),name='forgot_password'),
        path('reset-password/<str:token>/',PasswordResetView.as_view(),name='reset_password'),
        path('emaildetail/',UserEmail.as_view(),name='email'),
        path('',index),
]