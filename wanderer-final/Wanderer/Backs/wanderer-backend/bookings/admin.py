from django.contrib import admin
from .models import Booking
# Register your models here.


class BookingAdmin(admin.ModelAdmin):
    # Add filtering options
    list_filter = ['status']  # Enables filtering by status in the admin
    list_display = ['user', 'package', 'status',
                    'booking_date']  # Customize displayed columns
    search_fields = ['user__username', 'package__name',
                     'full_name', 'phone_number']  # Add search functionality
    ordering = ['booking_date']  # Order by booking date by default


admin.site.register(Booking, BookingAdmin)
admin.site.site_header = "Wanderer Admin"


# class PurchaseAdmin(admin.ModelAdmin):
#     list_display = ['user', 'amount', 'currency', 'payment_status',
#                     'stripe_payment_intent', 'booking_details', 'created_at']


# admin.site.register(Purchase, PurchaseAdmin)
admin.site.site_header = "Wanderer Admin"