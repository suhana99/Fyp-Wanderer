from django.db.models.signals import m2m_changed
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Package

@receiver(post_save, sender=Package)
def calculate_price_after_creation(sender, instance, created, **kwargs):
    if created:  # Only for initial creation
        instance.price = instance.calculate_price()
        instance.save(update_fields=['price'])

@receiver(m2m_changed, sender=Package.hotels.through)
@receiver(m2m_changed, sender=Package.activities.through)
def update_package_price_m2m(sender, instance, action, **kwargs):
    print(f"Signal triggered with action: {action}")
    if action in ['post_add', 'post_remove', 'post_clear']:
        hotel_price = sum(
            package_hotel.calculate_hotel_price()
            for package_hotel in instance.package_hotels.all()
        )
        activity_price = sum(activity.price for activity in instance.activities.all())
        
        # Update the price and save it
        instance.price = instance.base_price + hotel_price + activity_price
        instance.save(update_fields=['price'])
        print(f"Updated price after m2m change: {instance.price}")
