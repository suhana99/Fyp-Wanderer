from django.contrib.auth import get_user_model
from django.db import models
from django.conf import settings  # Import settings to use AUTH_USER_MODEL
# Ensure Package model is correctly imported
from package.models import Package, Hotel,Activity
from users.models import CustomUser

User = get_user_model()


class Booking(models.Model):
    STATUS = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('pending', 'Pending'),
        ('completed', 'Completed')
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

    def save(self, *args, **kwargs):
        # Call the superclass save method
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.package.name} - {self.status}"
    


# class Purchase(models.Model):
#     user = models.ForeignKey(
#         User, on_delete=models.CASCADE, related_name="purchases")
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     currency = models.CharField(max_length=10)
#     payment_status = models.CharField(max_length=50)
#     stripe_payment_intent = models.CharField(max_length=255, unique=True)
#     # Store additional booking info (e.g., number of people, date)
#     booking_details = models.JSONField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Purchase {self.id} - User {self.user.username} - {self.payment_status}"