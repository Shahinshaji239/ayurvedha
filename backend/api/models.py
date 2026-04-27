from django.db import models
from django.contrib.auth.models import User

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    bio = models.TextField()
    experience = models.CharField(max_length=100)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=0.0)
    image = models.TextField(blank=True, null=True)  # Supports both URLs and base64

    def __str__(self):
        return self.name

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    phone = models.CharField(max_length=15, unique=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    image = models.TextField(blank=True, null=True) # Base64 for MVP
    dosha_type = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.user.username

class Appointment(models.Model):
    TYPES = (('ONLINE', 'Online'), ('OFFLINE', 'Offline'))
    STATUS = (('PENDING', 'Pending'), ('SCHEDULED', 'Scheduled'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled'))
    
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time = models.TimeField()
    type = models.CharField(max_length=10, choices=TYPES, default='ONLINE')
    status = models.CharField(max_length=10, choices=STATUS, default='PENDING')
    paid = models.BooleanField(default=False)
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.date}"

class TimeSlot(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='time_slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('doctor', 'date', 'start_time')

    def __str__(self):
        return f"{self.doctor} - {self.date} {self.start_time}"


class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    notes = models.TextField()
    medicines = models.JSONField(default=list) # List of {name, dosage, duration}
    diet_plan = models.JSONField(default=list) # List of tips
    lifestyle_tips = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.appointment}"

class Blog(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    thumbnail = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title

class DietPlan(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='diet_plans')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='diet_plans')
    title = models.CharField(max_length=255)
    duration_days = models.IntegerField()
    general_instructions = models.TextField(blank=True, null=True)
    restrictions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} for {self.patient.user.username}"

class DietDay(models.Model):
    diet_plan = models.ForeignKey(DietPlan, on_delete=models.CASCADE, related_name='days')
    day_number = models.IntegerField()
    morning_meal = models.TextField()
    afternoon_meal = models.TextField()
    evening_meal = models.TextField()

    def __str__(self):
        return f"Day {self.day_number} of {self.diet_plan.title}"

class ChatMessage(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='chat_messages')
    sender_role = models.CharField(max_length=10)  # 'doctor' or 'patient'
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.sender_role}] {self.message[:40]}"
