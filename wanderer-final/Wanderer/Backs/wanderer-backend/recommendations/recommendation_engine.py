from django.db.models import Avg, Count, Q, F
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.stats import pearsonr
import pandas as pd
from django.core.cache import cache
from users.models import CustomUser
from package.models import Package,Review
from bookings.models import Booking

class RecommendationEngine:
    def __init__(self):
        self.cache_timeout = 3600  # 1 hour cache
        self.booking_weight = 0.7  # Weight for booking-based similarity
        self.review_weight = 0.3   # Weight for review-based similarity

    def get_user_preferences(self, user_id):
        """Get user's preferences based on both ratings and bookings"""
        try:
            user = CustomUser.objects.get(id=user_id, role='user')
        except CustomUser.DoesNotExist:
            return {}, {}

        # Get ratings
        ratings = {
    review.package.id: review.rating 
    for review in Review.objects.filter(
        user__email=user.email,  # Fetch reviews for the user with a specific email
        user__role='user'        # Ensure the user has the 'user' role
    ).select_related('package')  # Use select_related to fetch related 'package' in the same query
}


        # Get bookings with status
        bookings = {
            booking.package_id: self._get_booking_score(booking.status)
            for booking in Booking.objects.filter(
                user_id=user_id,
                user__role='user'
            ).select_related('package')
        }

        return ratings, bookings

    # def _get_booking_score(self, status):
    #     """Convert booking status to numerical score"""
    #     status_scores = {
    #         'completed': 1.0,    # Completed bookings get highest score
    #         'approved': 0.8,     # Approved but not yet completed
    #         'pending': 0.5,      # Pending bookings show some interest
    #         'rejected': 0.2,     # Rejected bookings might indicate negative preference
    #         'cancelled': 0.3     # Cancelled bookings might indicate changed mind
    #     }
    #     return status_scores.get(status.lower(), 0.5)

    # def get_package_features(self, package):
    #     """Extract features from a package for content-based filtering"""
    #     activities = list(package.activities.values_list('name', flat=True))
    #     hotels = list(package.hotels.values_list('name', flat=True))
        
    #     # Enhanced feature vector including popularity metrics
    #     features = {
    #         'location': package.location,
    #         'price_range': self._get_price_range(package.base_price),
    #         'duration': package.duration,
    #         'activities': ','.join(activities),
    #         'hotels': ','.join(hotels),
    #         'booking_rate': self._get_booking_rate(package),
    #         'completion_rate': self._get_completion_rate(package)
    #     }
    #     return features

    # def _get_booking_rate(self, package):
    #     """Calculate booking rate for package"""
    #     total_views = package.view_count if hasattr(package, 'view_count') else 0
    #     if total_views == 0:
    #         return 0
        
    #     booking_count = Booking.objects.filter(
    #         package=package,
    #         status__in=['approved', 'completed']
    #     ).count()
        
    #     return booking_count / total_views if total_views > 0 else 0

    # def _get_completion_rate(self, package):
    #     """Calculate successful completion rate for package bookings"""
    #     total_bookings = Booking.objects.filter(package=package).count()
    #     if total_bookings == 0:
    #         return 0
        
    #     completed_bookings = Booking.objects.filter(
    #         package=package,
    #         status='completed'
    #     ).count()
        
    #     return completed_bookings / total_bookings if total_bookings > 0 else 0

    # def get_content_based_recommendations(self, user_id, num_recommendations=10):
    #     """Generate content-based recommendations using cosine similarity"""
    #     try:
    #         user = CustomUser.objects.get(id=user_id, role='user')
    #     except CustomUser.DoesNotExist:
    #         return []

    #     # Get user's preferences
    #     ratings, bookings = self.get_user_preferences(user_id)
    #     if not ratings and not bookings:
    #         return []

    #     # Get all packages and their features
    #     all_packages = Package.objects.filter(availability=True)
    #     package_features = {
    #         package.id: self.get_package_features(package) 
    #         for package in all_packages
    #     }

    #     # Convert features to numerical vectors
    #     df = pd.DataFrame.from_dict(package_features, orient='index')
    #     df_encoded = pd.get_dummies(df)

    #     # Calculate similarity between packages
    #     similarity_matrix = cosine_similarity(df_encoded)

    #     # Calculate weighted recommendations based on both ratings and bookings
    #     recommendations = {}
    #     for pkg_id in set(list(ratings.keys()) + list(bookings.keys())):
    #         try:
    #             pkg_idx = list(package_features.keys()).index(pkg_id)
    #             similarities = similarity_matrix[pkg_idx]
                
    #             # Combine rating and booking scores
    #             score = (
    #                 self.review_weight * ratings.get(pkg_id, 0) +
    #                 self.booking_weight * bookings.get(pkg_id, 0)
    #             )
                
    #             for idx, similarity in enumerate(similarities):
    #                 other_pkg_id = list(package_features.keys())[idx]
    #                 if other_pkg_id not in ratings and other_pkg_id not in bookings:
    #                     recommendations[other_pkg_id] = recommendations.get(other_pkg_id, 0) + (similarity * score)
    #         except ValueError:
    #             continue

    #     sorted_recommendations = sorted(
    #         recommendations.items(), 
    #         key=lambda x: x[1], 
    #         reverse=True
    #     )[:num_recommendations]

    #     return [pkg_id for pkg_id, score in sorted_recommendations]

    # def get_collaborative_recommendations(self, user_id, num_recommendations=10):
    #     """Generate collaborative recommendations using Pearson correlation"""
    #     try:
    #         user = CustomUser.objects.get(id=user_id, role='user')
    #     except CustomUser.DoesNotExist:
    #         return []

    #     # Get all users' preferences (both ratings and bookings)
    #     all_ratings = {}
    #     all_bookings = {}
        
    #     # Collect ratings
    #     for review in Review.objects.filter(user__role='user').select_related('user', 'package'):
    #         if review.user_id not in all_ratings:
    #             all_ratings[review.user_id] = {}
    #         all_ratings[review.user_id][review.package_id] = review.rating

    #     # Collect bookings
    #     for booking in Booking.objects.filter(user__role='user').select_related('user', 'package'):
    #         if booking.user_id not in all_bookings:
    #             all_bookings[booking.user_id] = {}
    #         all_bookings[booking.user_id][booking.package_id] = self._get_booking_score(booking.status)

    #     # Combine ratings and bookings for similarity calculation
    #     user_preferences = {}
    #     for user_id in set(list(all_ratings.keys()) + list(all_bookings.keys())):
    #         user_preferences[user_id] = {}
    #         for pkg_id in set(list(all_ratings.get(user_id, {}).keys()) + list(all_bookings.get(user_id, {}).keys())):
    #             user_preferences[user_id][pkg_id] = (
    #                 self.review_weight * all_ratings.get(user_id, {}).get(pkg_id, 0) +
    #                 self.booking_weight * all_bookings.get(user_id, {}).get(pkg_id, 0)
    #             )

    #     if user_id not in user_preferences:
    #         return []

    #     # Calculate similarity with other users
    #     user_similarities = {}
    #     user_prefs = user_preferences[user_id]
        
    #     for other_user_id, other_prefs in user_preferences.items():
    #         if other_user_id == user_id:
    #             continue

    #         common_packages = set(user_prefs.keys()) & set(other_prefs.keys())
    #         if len(common_packages) < 3:
    #             continue

    #         user_common_prefs = [user_prefs[pkg] for pkg in common_packages]
    #         other_common_prefs = [other_prefs[pkg] for pkg in common_packages]
            
    #         correlation, _ = pearsonr(user_common_prefs, other_common_prefs)
    #         if not np.isnan(correlation):
    #             user_similarities[other_user_id] = correlation

    #     # Get recommendations based on similar users
    #     recommendations = {}
    #     for other_user_id, similarity in user_similarities.items():
    #         if similarity <= 0:
    #             continue

    #         for package_id, score in user_preferences[other_user_id].items():
    #             if package_id not in user_prefs:
    #                 recommendations[package_id] = recommendations.get(package_id, 0) + (similarity * score)

    #     sorted_recommendations = sorted(
    #         recommendations.items(), 
    #         key=lambda x: x[1], 
    #         reverse=True
    #     )[:num_recommendations]

    #     return [pkg_id for pkg_id, score in sorted_recommendations]

    # def get_popular_packages(self, num_recommendations=10):
    #     """Get popular packages based on bookings, ratings, and views"""
    #     cache_key = f'popular_packages_{num_recommendations}'
    #     cached_results = cache.get(cache_key)
        
    #     if cached_results is None:
    #         # Calculate popularity score using multiple factors
    #         popular_packages = Package.objects.filter(
    #             availability=True
    #         ).annotate(
    #             avg_rating=Avg('review__rating', filter=Q(review__user__role='user')),
    #             num_reviews=Count('review', filter=Q(review__user__role='user')),
    #             num_bookings=Count('booking', filter=Q(
    #                 booking__user__role='user',
    #                 booking__status__in=['approved', 'completed']
    #             )),
    #             completion_rate=Count(
    #                 'booking',
    #                 filter=Q(booking__status='completed')
    #             ) * 1.0 / Count('booking'),
    #             popularity_score=(
    #                 F('avg_rating') * 0.4 +  # 40% weight to ratings
    #                 F('num_bookings') * 0.4 + # 40% weight to successful bookings
    #                 F('completion_rate') * 0.2  # 20% weight to completion rate
    #             )
    #         ).filter(
    #             num_reviews__gte=5
    #         ).order_by(
    #             '-popularity_score',
    #             '-num_bookings'
    #         )[:num_recommendations]

    #         cached_results = [pkg.id for pkg in popular_packages]
    #         cache.set(cache_key, cached_results, self.cache_timeout)

    #     return cached_results

    # def get_recommendations(self, user_id=None, num_recommendations=10):
    #     """Get hybrid recommendations combining different approaches"""
    #     if not user_id:
    #         return self.get_popular_packages(num_recommendations)

    #     try:
    #         user = CustomUser.objects.get(id=user_id, role='user')
    #     except CustomUser.DoesNotExist:
    #         return self.get_popular_packages(num_recommendations)

    #     # Check if user has enough interaction history
    #     ratings_count = Review.objects.filter(user_id=user_id, user__role='user').count()
    #     bookings_count = Booking.objects.filter(user_id=user_id, user__role='user').count()
        
    #     if (ratings_count + bookings_count) < 3:
    #         return self.get_popular_packages(num_recommendations)

    #     # Get both types of recommendations
    #     content_based = set(self.get_content_based_recommendations(
    #         user_id, 
    #         num_recommendations
    #     ))
    #     collaborative = set(self.get_collaborative_recommendations(
    #         user_id, 
    #         num_recommendations
    #     ))

    #     # Combine recommendations
    #     hybrid_recommendations = list(content_based & collaborative)
    #     hybrid_recommendations.extend(list(content_based - collaborative))
    #     hybrid_recommendations.extend(list(collaborative - content_based))

    #     return hybrid_recommendations[:num_recommendations]

