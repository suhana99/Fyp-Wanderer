from django.urls import path
from .views import *


urlpatterns = [
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('confirm/', ConfirmBookingView.as_view(), name='confirm-booking'),
    path('list/', ListBookingsView.as_view(), name='list-bookings'),
    path('dashboard/seller/', SellerDashboardView.as_view(),
         name='seller-dashboard'),
    path('', booking),
    path('bookings-history/', BookingHistory.as_view(), name='specific-user-booking-history'),
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
#     path('create-payment-intent/', PaymentIntentView.as_view(),
#          name='create_payment_intent'),
#     path('save-purchase/', PurchaseView.as_view(), name='save_purchase'),
]