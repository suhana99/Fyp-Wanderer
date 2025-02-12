from django.contrib.auth import get_user_model
from django.db import models
from django.conf import settings  # Import settings to use AUTH_USER_MODEL
# Ensure Package model is correctly imported
from package.models import Package, Hotel,Activity
from users.models import CustomUser
from django.utils import timezone
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY 

User = get_user_model()


class Booking(models.Model):
    STATUS = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancellation requested', 'Cancellation requested'),
        ('refunded','Refunded')
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'user'})
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, default='')
    phone_number = models.CharField(max_length=15, default='')
    additional_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS, default='Pending')
    booking_date = models.DateTimeField(auto_now_add=False)
    hotel = models.JSONField(default=list)
    activity = models.JSONField(default=list)
    stripe_checkout_session_id = models.CharField(max_length=255, null=True, blank=True)
    number_of_people=models.IntegerField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Stores amount in dollars


    def save(self, *args, **kwargs):
        # Call the superclass save method
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.package.name} - {self.status}"
    
    account_number = models.CharField(max_length=50, blank=True, null=True)
    account_holder_name = models.CharField(max_length=255, blank=True, null=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)

    def cancel_booking(self, reason, account_number, account_holder_name, bank_name):
        """ Cancels the booking and triggers a refund if payment was made. """
        if self.status in ['completed', 'cancelled', 'rejected']:
            return False  # Cannot cancel after completion or rejection
        
        if timezone.now() < self.booking_date:  # Ensure it's before the booking date
            self.status = 'cancellation requested'
            self.cancellation_reason = reason
            self.account_number = account_number  # Store account number
            self.account_holder_name = account_holder_name  # Store account holder name
            self.bank_name = bank_name  # Store bank name
            self.save()

            # Process Stripe refund if payment was made
            if self.stripe_checkout_session_id:
                try:
                    session = stripe.checkout.Session.retrieve(self.stripe_checkout_session_id)
                    payment_intent = session.payment_intent
                    stripe.Refund.create(payment_intent=payment_intent)
                    self.status = 'cancellation requested'
                    self.save()
                except stripe.error.StripeError as e:
                    print(f"Stripe refund failed: {e}")
                    return False

            return True
        return False
