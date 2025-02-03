from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from package.serializers import PackageSerializer
from recommendations.recommendation_engine import RecommendationEngine
from django.db.models import Avg, Count
from rest_framework.pagination import PageNumberPagination
from package.models import Package
from django.db import models
from django.db.models import Q
from django.db.models import Case, When


class RecommendationViewSet(ViewSet):
    recommendation_engine = RecommendationEngine()
    user_id = 1  # Example user ID, replace with a valid ID
    ratings, bookings = recommendation_engine.get_user_preferences(user_id)

    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = PageNumberPagination
    print("Ratings:", ratings)
    print("Bookings:", bookings)

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #     self.recommendation_engine = RecommendationEngine()

    # @action(detail=False, methods=['GET'])
    # def get_recommendations(self, request):
    #     user_id = request.user.id if request.user.is_authenticated and getattr(request.user, 'role', None) == 'user' else None
    #     num_recommendations = int(request.query_params.get('limit', 10))
        
    #     # Get recommended package IDs
    #     recommended_ids = self.recommendation_engine.get_recommendations(
    #         user_id=user_id,
    #         num_recommendations=num_recommendations
    #     )
    #     print(recommended_ids)
        
    #     if not recommended_ids:
    #         return Response([])

    #     # Get package details with aggregated data
    #     when_statements = [When(id=pk, then=pos) for pos, pk in enumerate(recommended_ids)]
    #     recommended_packages = Package.objects.filter(
    #         id__in=recommended_ids
    #     )

    #     print(recommended_packages)
        
    #     # Get paginated response
    #     page = self.paginate_queryset(recommended_packages)
    #     if page is not None:
    #         serializer = PackageSerializer(page, many=True)
    #         return self.get_paginated_response(serializer.data)

    #     serializer = PackageSerializer(recommended_packages, many=True)
    #     return Response(serializer.data)

    # @action(detail=False, methods=['GET'])
    # def popular_packages(self, request):
    #     """Endpoint for getting popular packages"""
    #     num_recommendations = int(request.query_params.get('limit', 10))
    #     popular_ids = self.recommendation_engine.get_popular_packages(num_recommendations)
        
    #     popular_packages = Package.objects.filter(
    #         id__in=popular_ids
    #     ).annotate(
    #         avg_rating=Avg('review__rating'),
    #         num_reviews=Count('reviews'),
    #         num_bookings=Count('booking')
    #     )
        
    #     ordered_packages = sorted(
    #         popular_packages,
    #         key=lambda x: popular_ids.index(x.id)
    #     )
        
    #     serializer = PackageSerializer(ordered_packages, many=True)
    #     return Response(serializer.data)