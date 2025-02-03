from django.core.management.base import BaseCommand
import random
from package.models import Package, Hotel, Activity, Review,PackageHotel
from bookings.models import Booking
from users.models import CustomUser
import os
from django.conf import settings
from faker import Faker


fake = Faker()


class Command(BaseCommand):
    help = "Generate dummy data for hotels, activities, packages, users, bookings, and reviews"


    def handle(self, *args, **kwargs):
        self.create_dummy_users(num_users=50)
        self.create_dummy_hotels(num_hotels=40)
        self.create_dummy_activities(num_activities=40)
        self.create_dummy_packages(num_packages=150)
        self.create_dummy_bookings(num_bookings=300)
        self.create_dummy_reviews(num_reviews=2000)
        self.stdout.write(self.style.SUCCESS("Dummy data created successfully!"))


    def create_dummy_users(self, num_users=50):
        roles = {
            "hotel_owner": 15,        # Create 15 hotel owners
            "activity_lister": 15,    # Create 15 activity listers
            "user": 40                # Create 50 regular users
        }
        status_options = ["approved", "pending"]


        for role, count in roles.items():
            for i in range(count):
                email = f"{role}{i + 1}@example.com"
                if not CustomUser.objects.filter(email=email).exists():
                    # Alternate statuses for users
                    if role in ['hotel_owner', 'activity_lister']:
                        status = status_options[i % 2]  
                    else:
                        status = 'approved'


                    user = CustomUser.objects.create_user(
                        email=email,
                        password="password123",
                        role=role,
                        is_approved=status
                    )
                    if role in ['hotel_owner', 'activity_lister']:
                        user.is_seller = True  # Mark as seller if hotel_owner or activity_lister
                        user.save()
        self.stdout.write("Dummy users with alternating statuses generated successfully!")



    def create_dummy_hotels(self, num_hotels=40):
        hotel_owners = CustomUser.objects.filter(role="hotel_owner")  # Get all hotel owners
        if hotel_owners:
            hotel_names = [
                "Hotel Everest", "Mountain View Resort", "Lakeside Inn",
                "Himalayan Retreat", "Sunrise Hotel", "Luxury Escape",
                "Lama Guest House", "Budget Stay", "Urban Oasis", "Hilltop Haven", "Tranquil Stay", "Barahi Jungle Resort"
            ]
            locations = ["Kathmandu", "Pokhara", "Lumbini", "Everest Base Camp", "Chitwan", "Annapurna Circuit","Nagarkot","Dhulikhel"]
            for _ in range(num_hotels):
                hotel_owner = random.choice(hotel_owners)  # Randomly choose a hotel owner
                Hotel.objects.create(
                    name=random.choice(hotel_names),
                    location=random.choice(locations),
                    price=random.randint(3000, 10000),
                    owner=hotel_owner  # Assign the random hotel owner
                )
            print(f"{num_hotels} dummy hotels created!")




    def create_dummy_activities(self, num_activities=40):
        activity_listers = CustomUser.objects.filter(role="activity_lister")  # Get all activity listers
        if activity_listers:
            activity_names = {
                "Adventure": [
                    "Paragliding", "Rafting", "Mountain Biking", "Jungle Safari", "Trekking", "Rock Climbing", "Bungee Jumping"
                ],
                "Luxury": [
                    "Spa", "Luxury Cruise", "Private Dinner", "Helicopter Ride", "Wine Tasting"
                ],
                "Cultural": [
                    "Cultural Tour", "Museum Visit", "Traditional Dance Show", "Cooking Class"
                ],
                "Eco-Tourism": [
                    "Nature Walk", "Eco Lodge Stay", "Bird Watching", "Wildlife Safari", "Organic Farm Visit"
                ],
                "Family-Friendly": [
                    "Amusement Park", "Water Land", "Zoo Visit", "Kids' Adventure Park"
                ]
            }
            locations = ["Kathmandu", "Pokhara", "Lumbini", "Everest Base Camp", "Chitwan", "Annapurna Circuit","Nagarkot","Dhulikhel"]
            
            # Create activities
            for theme, names in activity_names.items():
                for name in names:
                    activity_lister = random.choice(activity_listers)  # Randomly choose an activity lister
                    Activity.objects.create(
                        name=name,
                        price=random.randint(1500, 5000),
                        location=random.choice(locations),
                        owner=activity_lister  # Assign the random activity lister
                    )
            print(f"{num_activities} dummy activities created!")




    def create_dummy_packages(self, num_packages=150):
        locations = ["Kathmandu", "Pokhara", "Lumbini", "Everest Base Camp", "Chitwan", "Annapurna Circuit", "Nagarkot", "Dhulikhel"]
        hotels = list(Hotel.objects.all())
        activities = list(Activity.objects.all())
        image_folder_path = os.path.join(settings.MEDIA_ROOT, 'uploads', 'packages')
        images = [f for f in os.listdir(image_folder_path) if f.endswith(('jpg', 'png', 'jpeg', 'webp'))]

        themes = {
            "Adventure": [
                "Thrilling activities for adrenaline seekers.",
                "Experience the ultimate outdoor adventures.",
                "Discover breathtaking trails and challenges."
            ],
            "Luxury": [
                "Indulge in comfort and style.",
                "Pamper yourself with exclusive amenities.",
                "A lavish experience like no other."
            ],
            "Cultural": [
                "Immerse yourself in local traditions.",
                "Explore historic landmarks and heritage sites.",
                "A journey through rich cultural landscapes."
            ],
            "Family-Friendly": [
                "Fun-filled experiences for the whole family.",
                "Safe and engaging activities for all ages.",
                "Create unforgettable memories together."
            ],
            "Eco-Tourism": [
                "Connect with nature in a sustainable way.",
                "Explore pristine landscapes responsibly.",
                "Perfect for eco-conscious travelers."
            ],
        }

        # Create a dictionary of activities mapped to themes (this could be based on location, etc.)
        theme_activity_map = {
            "Adventure": ["Paragliding", "Mountain Biking", "Rafting", "Trekking", "Rock Climbing"],
            "Luxury": ["Spa", "Luxury Cruise", "Private Dinner", "Helicopter Ride", "Wine Tasting"],
            "Cultural": ["Cultural Tour", "Museum Visit", "Traditional Dance Show", "Cooking Class"],
            "Family-Friendly": ["Amusement Park", "Water Land", "Zoo Visit", "Kids' Adventure Park"],
            "Eco-Tourism": ["Nature Walk", "Eco Lodge Stay", "Bird Watching", "Wildlife Safari", "Organic Farm Visit"]
        }

        for i in range(num_packages):
            # Randomly select a theme and generate description
            theme = random.choice(list(themes.keys()))
            description = random.choice(themes[theme])

            # Randomly select package location
            location = random.choice(locations)

            # Create the package
            package = Package.objects.create(
                name=f"Package {i + 1} - {theme}",
                location=location,  # Set the location to ensure consistency
                description=description,
                base_price=random.randint(500, 3000),
                duration=random.randint(3, 15),  # Duration in days
                availability=random.choice([True, False]),
            )

            # Add an image to the package if available
            if images:
                image_file = random.choice(images)
                package.image = os.path.join('uploads', 'packages', image_file)
                package.save()

            # Filter hotels by the selected package location
            available_hotels = [hotel for hotel in hotels if hotel.location == location]

            # Ensure at least 2 hotels are added, but no more than the available hotels
            num_hotels = random.randint(2, min(4, len(available_hotels)))  # Ensure the sample size doesn't exceed available hotels
            if num_hotels == 0:
                num_hotels = 1  # Fallback if there are no hotels in the location

            selected_hotels = random.sample(available_hotels, num_hotels)

            # Calculate the total duration of the package
            total_duration = package.duration

            # Randomly distribute the number of days for each hotel, ensuring the total duration is not exceeded
            remaining_days = total_duration
            hotel_days = []

            # Allocate days to each hotel ensuring the total doesn't exceed the package duration
            for hotel in selected_hotels[:-1]:
                if remaining_days - len(selected_hotels) + 1 <= 1:
                    # If only one day is left for the remaining hotel, allocate it directly
                    hotel_days.append(remaining_days)
                    remaining_days = 0
                else:
                    days = random.randint(1, remaining_days - len(selected_hotels) + 1)
                    hotel_days.append(days)
                    remaining_days -= days

            # The last hotel gets the remaining days
            if remaining_days > 0:
                hotel_days.append(remaining_days)

            # Add hotels and days to the package using PackageHotel intermediary model
            for hotel, days in zip(selected_hotels, hotel_days):
                package_hotel = PackageHotel.objects.create(package=package, hotel=hotel, number_of_days=days)

            # Now, select activities based on the theme of the package
            # Get all activities that match the theme of the package
            theme_activities = theme_activity_map.get(theme, [])
            available_activities = [activity for activity in activities if activity.name in theme_activities]

            # Ensure at least 2 activities and at most 4 activities
            num_activities = random.randint(2, min(4, len(available_activities)))  # Ensure the sample size doesn't exceed available activities
            if num_activities == 0:
                num_activities = 1  # Fallback if there are no activities for the theme

            selected_activities = random.sample(available_activities, num_activities)  # Randomly select activities
            package.activities.add(*selected_activities)

            # Save the package after adding hotels and activities
            package.save()

        print(f"{num_packages} dummy packages created!")



    def create_dummy_bookings(self, num_bookings=300):
        users = CustomUser.objects.filter(role="user")
        packages = Package.objects.all()
        for _ in range(num_bookings):
            user = CustomUser.objects.filter(role='user').order_by('?').first()
            package = Package.objects.order_by('?').first()
            hotel = Hotel.objects.order_by('?').first()
            activity = Activity.objects.order_by('?').first()
            Booking.objects.create(
                user=user,
                package=package,
                full_name=fake.name(),
                phone_number=random.randint(9600000000,9899999999),
                additional_notes=fake.text(),
                status=random.choice(['approved', 'pending', 'rejected']),
                hotel=hotel,
                activity=activity,
            )
        self.stdout.write(self.style.SUCCESS('Successfully created sample bookings'))


    def create_dummy_reviews(self, num_reviews=2000):
        users = CustomUser.objects.filter(role="user")
        packages = Package.objects.all()
        for _ in range(num_reviews):
            user = random.choice(users)
            package = random.choice(packages)
            Review.objects.create(
                user=user,
                package=package,
                rating=random.randint(1, 5),
                comment=random.choice([
                    "Amazing experience!",
                    "Could have been better.",
                    "Loved the trip, highly recommend!",
                    "Not worth the price.",
                    "Decent package overall."
                ])
            )
        print(f"{num_reviews} dummy reviews created!")
