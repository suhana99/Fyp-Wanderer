from django.db import models
from users.models import CustomUser
# Create your models here.
class CustomerDiary(models.Model):
    title=models.CharField(max_length=200)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='diaries')
    image = models.ImageField(upload_to='diary_images/', blank=True, null=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author.email}'s diary entry ({self.created_at})"