from django.contrib import admin
from .models import DoctorProfile, PatientProfile, Appointment, Prescription, Blog

admin.site.register(DoctorProfile)
admin.site.register(PatientProfile)
admin.site.register(Appointment)
admin.site.register(Prescription)
admin.site.register(Blog)
