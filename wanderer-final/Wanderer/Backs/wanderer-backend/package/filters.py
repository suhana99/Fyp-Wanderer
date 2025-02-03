import django_filters
from .models import Package
class PackageFilter(django_filters.FilterSet):
    class Meta:
        location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
        duration = django_filters.CharFilter(field_name='duration', lookup_expr='icontains')
        id = django_filters.CharFilter(field_name='id', lookup_expr='icontains')
        model = Package
        fields = ['location','duration','id']