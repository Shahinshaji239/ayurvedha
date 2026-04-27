from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'blogs', BlogViewSet)

urlpatterns = [
    path('register/', register_user, name='register'),
    path('create-appointment/', create_appointment, name='create-appointment'),
    path('login/', login_user, name='login'),
    path('create-doctor/', create_doctor, name='create-doctor'),
    path('admin-stats/', get_admin_stats, name='admin-stats'),
    path('patient-dashboard/', get_patient_dashboard, name='patient-dashboard'),
    path('patient-profile/', patient_profile, name='patient-profile'),
    path('doctor-dashboard/', get_doctor_dashboard, name='doctor-dashboard'),
    path('create-diet-plan/', create_diet_plan, name='create-diet-plan'),
    path('doctor-diet-plans/', get_doctor_diet_plans, name='doctor-diet-plans'),
    path('delete-diet-plan/<int:plan_id>/', delete_diet_plan, name='delete-diet-plan'),
    path('update-diet-plan/<int:plan_id>/', update_diet_plan, name='update-diet-plan'),
    path('doctor-patients/', get_doctor_patients, name='doctor-patients'),
    path('jaas-jwt/', generate_jaas_jwt, name='jaas-jwt'),
    path('create-razorpay-order/', create_razorpay_order, name='create-razorpay-order'),
    path('verify-razorpay-payment/', verify_razorpay_payment, name='verify-razorpay-payment'),
    path('create-prescription/', create_prescription, name='create-prescription'),
    path('patient-diet-plan/', get_patient_diet_plan, name='patient-diet-plan'),
    path('doctor-profile/', doctor_profile_api, name='doctor-profile'),
    path('doctor-prescriptions/', get_doctor_prescriptions, name='doctor-prescriptions'),
    path('update-appointment-status/', update_appointment_status, name='update-appointment-status'),
    path('doctor-slots/', get_doctor_slots, name='doctor-slots'),
    path('add-doctor-slot/', add_doctor_slot, name='add-doctor-slot'),
    path('delete-doctor-slot/<int:slot_id>/', delete_doctor_slot, name='delete-doctor-slot'),
    path('', include(router.urls)),
]
