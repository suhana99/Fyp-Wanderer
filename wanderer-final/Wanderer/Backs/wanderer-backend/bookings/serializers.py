import datetime
from rest_framework import serializers
from .models import Booking
from package.models import Hotel,Activity,PackageHotel
from users.models import CustomUser
from package.serializers import PackageSerializer


class BookingSerializer(serializers.ModelSerializer):
    hotel = serializers.ListField(child=serializers.IntegerField(), required=False)
    activity = serializers.ListField(child=serializers.IntegerField(), required=False)
    class Meta:
        model = Booking
        fields = ['id', 'user', 'package', 'full_name',
                  'phone_number','booking_date','number_of_people','stripe_checkout_session_id','hotel','activity']
        read_only_fields = ['id', 'user', 'status','stripe_checkout_session_id']

from datetime import timedelta


class BookingHistorySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    package = PackageSerializer()
    completion_date = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'  # OR explicitly list all fields including 'completion_date'

    def get_completion_date(self, obj):
        if obj.booking_date and obj.package.duration:
            return obj.booking_date + timedelta(days=obj.package.duration)
        return None


    # def validate(self, data):
    #     # Get the selected package
    #     package = data.get('package')

    #     # Filter hotels and activities based on the package
    #     if package:
    #         package_hotels_queryset = PackageHotel.objects.filter(package=package)
    #         hotels = Hotel.objects.filter(id__in=package_hotels_queryset.values('hotel'))
    #         # activities_queryset = Activity.objects.filter(packageactivity=package)

    #         # Update the queryset for hotel and activity fields based on the package
    #         self.fields['hotel'].queryset = hotels
    #         # self.fields['activity'].queryset = activities_queryset

    #     return data

    # def create(self, validated_data):
    #     # Assuming the hotel is a ForeignKey and hotels_data is a single hotel instance or ID
    #     hotel = validated_data.get('hotel')  # Get the hotel instance
    #     booking = Booking.objects.create(**validated_data)
        
    #     if hotel:
    #         booking.hotel = hotel  # Assign the hotel to the booking
        
    #     booking.save()  # Save the booking instance after assigning the hotel
        
    #     return booking

def check_expiry_month(value):
    if not 1 <= int(value) <= 12:
        raise serializers.ValidationError("Invalid expiry month.")


def check_expiry_year(value):
    today = datetime.datetime.now()
    if not int(value) >= today.year:
        raise serializers.ValidationError("Invalid expiry year.")


def check_cvc(value):
    if not 3 <= len(value) <= 4:
        raise serializers.ValidationError("Invalid cvc number.")


def check_payment_method(value):
    payment_method = value.lower()
    if payment_method not in ["card"]:
        raise serializers.ValidationError("Invalid payment_method.")


class CardInformationSerializer(serializers.Serializer):
    card_number = serializers.CharField(max_length=150, required=True)
    expiry_month = serializers.CharField(
        max_length=150,
        required=True,
        validators=[check_expiry_month],
    )
    expiry_year = serializers.CharField(
        max_length=150,
        required=True,
        validators=[check_expiry_year],
    )
    cvc = serializers.CharField(
        max_length=150,
        required=True,
        validators=[check_cvc],
    )
