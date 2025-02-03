from rest_framework import generics, permissions
from .models import Event
from .serializers import EventSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required
from .forms import *
from users.auth import admin_only
from django.shortcuts import render,redirect
from django.contrib import messages
from rest_framework.exceptions import PermissionDenied

class EventUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        print(request.user.role)
        # event = view.get_object()
        if request.user.role == 'event_lister':
            return True
        else:
            raise PermissionDenied({"error": "You are not authorized for this view"})

# View to list all events
class EventListAPIView(APIView):
    def get(self, request):
        date = request.query_params.get('date', None)
        location = request.query_params.get('location', None)

        events = Event.objects.all()

        if date:
            events = events.filter(date=date)
        if location:
            events = events.filter(location=location)

        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# View to retrieve a single event's details
class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]  # All authenticated users can view event details

# View to create an event
class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [EventUserPermission]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# View to update an event (only accessible to admin users)
class EventUpdateView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [EventUserPermission]

    def get_object(self):
        obj = super().get_object()
        if obj.created_by != self.request.user:
            raise PermissionDenied("You are not allowed to edit or delete this review.")
        return obj

    def perform_update(self, serializer):
        # Allow updating the review
        serializer.save()
    

# View to delete an event (only accessible to admin users)
class EventDeleteView(generics.DestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    # permission_classes = [EventUserPermission]

    def get_object(self):
        obj = super().get_object()  # Retrieve the object based on the queryset and URL parameter
        # Check if the logged-in user is the creator of the event
        if obj.created_by != self.request.user:
            raise PermissionDenied("You are not allowed to update this event.")
        return obj

    def get_object(self):
        obj = super().get_object()
        if obj.created_by != self.request.user:
            raise PermissionDenied("You are not allowed to edit or delete this review.")
        return obj

    def perform_destroy(self, instance):
        # Allow deleting the review
        instance.delete()

class UserEventListAPIView(APIView):
    def get(self, request):
        # Fetch events only for the logged-in user
        events = Event.objects.filter(created_by=request.user)
        
        # Optional filtering
        date = request.query_params.get('date', None)
        location = request.query_params.get('location', None)
        
        if date:
            events = events.filter(date=date)
        if location:
            events = events.filter(location=location)
        
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@login_required
@admin_only
def index(request):
    events=Event.objects.all()

    context={
        'events':events,
    }
    return render(request,'calendar/events.html',context)

@login_required
@admin_only
def delete_event(request,event_id):
    event=Event.objects.get(id=event_id)
    event.delete()
    messages.add_message(request,messages.SUCCESS,'Events deleted.')
    return redirect('/calendar')