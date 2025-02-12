from django.contrib import admin
from .models import Booking

class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "package",
        "status",
        "booking_date",
        "cancellation_reason",
        "account_holder_name",  # Added for visibility
        "bank_name",  # Added for visibility
        "account_number",  # Added for visibility
    )
    search_fields = ("user__email", "package__name", "status", "account_holder_name", "bank_name")
    list_filter = ("status", "booking_date")

    fieldsets = (
        ("Booking Information", {
            "fields": ("user", "package", "status", "booking_date", "hotel", "activity", "number_of_people", "total_amount")
        }),
        ("Cancellation & Refund", {  # New section in Admin Panel
            "fields": ("cancellation_reason", "account_holder_name", "bank_name", "account_number")
        }),
        ("Payment Details", {
            "fields": ("stripe_checkout_session_id",)
        }),
    )

admin.site.register(Booking, BookingAdmin)

admin.site.site_header = "Wanderer Admin"

