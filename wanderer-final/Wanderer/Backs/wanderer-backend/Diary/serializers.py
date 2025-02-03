from rest_framework import serializers
from .models import CustomerDiary

class CustomerDiarySerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.id')
    author_email = serializers.ReadOnlyField(source='author.email')

    class Meta:
        model = CustomerDiary
        fields = ['id', 'title','author','author_email', 'image', 'description', 'created_at', 'updated_at']
