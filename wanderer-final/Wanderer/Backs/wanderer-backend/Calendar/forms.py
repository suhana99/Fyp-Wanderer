from django.forms import ModelForm
from .models import *

class EventForm(ModelForm):
    class Meta:
        model=Event
        fields='__all__'

        