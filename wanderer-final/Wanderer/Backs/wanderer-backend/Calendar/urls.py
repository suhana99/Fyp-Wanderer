from django.urls import path
from .views import *

urlpatterns = [
    path('events/', EventListAPIView.as_view(), name='event-list'),  # To list all events
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),  # To view event details
    path('events/create/', EventCreateView.as_view(), name='event-create'),  # To create events
    path('events/<int:pk>/update/', EventUpdateView.as_view(), name='event-update'),  # To update events
    path('events/<int:pk>/delete/', EventDeleteView.as_view(), name='event-delete'),  # To delete events
    path('events/user/', UserEventListAPIView.as_view(), name='event-user'),  # To delete events
    path('',index),
    path('events/delete/<int:event_id>/',delete_event,name='delete_event'),
]