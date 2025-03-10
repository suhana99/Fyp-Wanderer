from django.contrib import admin
from .models import Package, Hotel, Activity, Review, PackageHotel ,UserCustomizedPackage # Import models


class HotelInline(admin.TabularInline):
    """
    Inline for displaying hotels directly in the Package admin interface.
    """
    model = Package.hotels.through  # Through model for ManyToManyField
    extra = 1  # Number of empty rows to display by default


class ActivityInline(admin.TabularInline):
    """
    Inline for displaying activities directly in the Package admin interface.
    """
    model = Package.activities.through
    extra = 1


class PackageHotelInline(admin.TabularInline):
    model = PackageHotel
    extra = 1


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    """
    Custom admin class for managing Package model.
    """
    list_display = ('name', 'price', 'availability',
                    'created_at')  # Fields to display in list view
    # Search functionality for name and location
    search_fields = ('name', 'location')
    # Filters for availability and location
    list_filter = ('availability', 'location')
    # Horizontal widget for ManyToMany fields
    filter_horizontal = ('activities',)
    # Add inline management for hotels and activities
    inlines = [HotelInline, ActivityInline]

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        """
        Custom queryset filtering for ManyToMany fields.
        """
        if db_field.name == "hotels":
            # Filter hotels to show only available ones
            kwargs["queryset"] = Hotel.objects.filter(availability=True)

        if db_field.name == "activities":
            # Filter activities to show only available ones
            kwargs["queryset"] = Activity.objects.filter(availability=True)

        return super().formfield_for_manytomany(db_field, request, **kwargs)


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    """
    Admin class for managing Hotel model.
    """
    list_display = ('name', 'location', 'availability',
                    'owner')  # Fields to display in list view
    # Search functionality for name and location
    search_fields = ('name', 'location')
    # Filters for availability and location
    list_filter = ('availability', 'location')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """
    Admin class for managing Activity model.
    """
    list_display = ('name', 'location', 'availability',
                    'owner')  # Fields to display in list view
    # Search functionality for name and location
    search_fields = ('name', 'location')
    # Filters for availability and location
    list_filter = ('availability', 'location')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Admin class for managing Review model.
    """
    list_display = ('package', 'user', 'rating',
                    'date_added')  # Fields to display in list view
    # Search functionality for package name and user email
    search_fields = ('package__name', 'user__email')
    list_filter = ('rating', 'date_added')  # Filters for rating and date added

admin.site.register(UserCustomizedPackage)
