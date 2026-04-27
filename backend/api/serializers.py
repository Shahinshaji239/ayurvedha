from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DoctorProfile, PatientProfile, Appointment, Prescription, Blog, DietPlan, DietDay, TimeSlot

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'

class PatientProfileSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='user.first_name')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = PatientProfile
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    patient_name = serializers.ReadOnlyField(source='patient.user.username')
    
    class Meta:
        model = Appointment
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

class DietDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = DietDay
        fields = '__all__'

class DietPlanSerializer(serializers.ModelSerializer):
    days = DietDaySerializer(many=True, read_only=True)
    patient_name = serializers.ReadOnlyField(source='patient.user.first_name')
    
    class Meta:
        model = DietPlan
        fields = '__all__'
