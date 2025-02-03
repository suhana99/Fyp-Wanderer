from django.urls import path
from recommendations.views import RecommendationViewSet

recommendation_view = RecommendationViewSet.as_view({'get': 'get_recommendations'})
popular_view = RecommendationViewSet.as_view({'get': 'popular_packages'})

urlpatterns = [
    path('get_recommendations/', recommendation_view, name='get_recommendations'),
    path('popular_packages/', popular_view, name='popular_packages'),
]
