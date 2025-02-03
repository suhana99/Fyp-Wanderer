from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.management import call_command
from users.models import CustomUser


@receiver(post_save, sender=CustomUser)
def export_user_data(sender, instance, created, **kwargs):
    if created:
        # Trigger export after a new user is created
        call_command('export_recommendation_data')
