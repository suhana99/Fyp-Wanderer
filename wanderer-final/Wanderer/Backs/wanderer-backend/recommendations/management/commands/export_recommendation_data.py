from django.core.management.base import BaseCommand
from package.models import Package,Review
from bookings.models import Booking
from users.models import CustomUser # Import the Review model
from django.db import models


import pandas as pd


class Command(BaseCommand):
    help = "Export data for recommendations"


    def handle(self, *args, **kwargs):
        # Extract package data, including description for content-based filtering
        packages = Package.objects.all()
        package_data = [
            {
                'package_id': p.id,
                'name': p.name,
                'location': p.location,
                'base_price': p.base_price,
                'duration': p.duration,
                'description': p.description  
            }
            for p in packages
        ]


        # Extract user bookings or customizations
        bookings = Booking.objects.filter(user__role='user')
        booking_data = [
            {
                'user_id': b.user.id,
                'user_email': b.user.email,
                'package_id': b.package.id,
            }
            for b in bookings
        ]


        # Extract reviews
        reviews = Review.objects.select_related('user', 'package').all()  # Efficient querying with select_related
        review_data = [
            {
                'review_id': r.id,
                'package_id': r.package.id,
                'user_id': r.user.id,
                'user_email': r.user.email,
                'rating': r.rating,
                'comment': r.comment,
                'date_added': r.date_added,
            }
            for r in reviews
        ]


        # Convert to pandas DataFrame for analysis
        package_df = pd.DataFrame(package_data)
        booking_df = pd.DataFrame(booking_data)
        review_df = pd.DataFrame(review_data)


        # Save to CSV (optional)
        package_df.to_csv('model data/prediction_server/packages.csv', index=False)
        booking_df.to_csv('model data/prediction_server/bookings.csv', index=False)
        review_df.to_csv('model data/prediction_server/reviews.csv', index=False)


        self.stdout.write(self.style.SUCCESS('Data exported successfully!'))
