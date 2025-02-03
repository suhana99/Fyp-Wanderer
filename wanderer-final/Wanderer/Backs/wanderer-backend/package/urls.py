from django.urls import path
from .views import *

urlpatterns = [
    path('hotels/', HotelListCreateView.as_view(), name='hotel-list-create'),
    path('hotels/<int:pk>/', HotelDetailAPIView.as_view(), name='hotel-detail'),
    path('hotels/user/',UserHotelListAPIView.as_view(),name='hotels-user'),
    path('activities/', ActivityListCreateView.as_view(), name='activity-list-create'),
    path('activities/user/',UserActivityListAPIView.as_view(),name='activities-user'),
    path('activities/<int:pk>/',ActivityDetailAPIView.as_view(),name='activity-detail'),
    path('packages/', PackageListView.as_view(), name='package-list'),
    path('packages/<int:pk>/', PackageDetailView.as_view(), name='package-detail'),
    path('packages/create/', CreatePackageView.as_view(), name='create-package'),
    path('packages/recommend/',PackageDetailAPIView.as_view(),name='package_filter'),
    path('packages/<int:package_id>/reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('',index),
    path('reviews/',index_r),
    path('reviews/delete/<int:review_id>/', delete_review, name='delete_review'),
    path('addPackage/',post_package),
    path('updatepackage/<int:Package_id>',update_package),
    path('deletepackage/<int:Package_id>',delete_package),
    path('packages/<int:package_id>/reviews/', PackageReviewListCreateView.as_view(), name='package-review-list-create'),
    path('packages/<int:package_id>/reviews/<int:pk>/', ReviewDetailView.as_view(), name='package-reviews-detail'),
    path('customize-package/<int:package_id>/', UserCustomizedPackageView.as_view(), name='customize-package'),
    path('packages/<int:package_id>/available-hotels/',AvailableHotelsForPackageView.as_view())
]
