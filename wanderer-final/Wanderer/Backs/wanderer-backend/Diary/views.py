from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import CustomerDiary
from .serializers import CustomerDiarySerializer
from .permissions import IsAuthorOrReadOnly
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from users.auth import admin_only
from django.shortcuts import render,redirect

class DiaryListCreateView(generics.ListCreateAPIView):
    queryset = CustomerDiary.objects.all()
    serializer_class = CustomerDiarySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class DiaryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomerDiary.objects.all()
    serializer_class = CustomerDiarySerializer
    permission_classes = [IsAuthorOrReadOnly]

@login_required
@admin_only
def index(request):
    #fetch data from the table
    diary=CustomerDiary.objects.all()
    context={
        'diary':diary
    }
    return render(request,'diary/diary.html',context)

@login_required
@admin_only
def delete_post(request,Diary_id):
    diary=CustomerDiary.objects.get(id=Diary_id)
    diary.delete()
    messages.add_message(request,messages.SUCCESS,'Post deleted.')
    return redirect('/diary')

