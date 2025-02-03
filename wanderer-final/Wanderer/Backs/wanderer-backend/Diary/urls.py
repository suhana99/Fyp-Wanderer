from django.urls import path
from .views import *

urlpatterns = [
    path('diaries/', DiaryListCreateView.as_view(), name='diary-list-create'),
    path('diaries/<int:pk>/', DiaryDetailView.as_view(), name='diary-detail'),
    path('',index),
    path('deletediary/<int:Diary_id>',delete_post),
]
