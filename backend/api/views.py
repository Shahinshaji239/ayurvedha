from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import DoctorProfile, PatientProfile, Appointment, Prescription, Blog, DietPlan, DietDay, ChatMessage, TimeSlot
from .serializers import *
from datetime import datetime, date, timedelta
import uuid, time as time_module


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_doctor_dashboard(request):
    try:
        email = request.GET.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        
        user = User.objects.get(username=email)
        doctor = user.doctor_profile
        
        today = date.today()
        
        # Stats
        today_appointments = Appointment.objects.filter(doctor=doctor, date=today)
        pending_consultations = Appointment.objects.filter(doctor=doctor, status='PENDING')
        total_patients = Appointment.objects.filter(doctor=doctor).values('patient').distinct().count()
        today_earnings = sum(a.doctor.consultation_fee for a in today_appointments if a.paid)
        
        # All appointments for the doctor (for the list view)
        all_appts = Appointment.objects.filter(doctor=doctor).order_by('-date', '-time')
        appointments_list = []
        for app in all_appts:
            appointments_list.append({
                'id': app.id,
                'patient_name': app.patient.user.first_name,
                'patient_id': app.patient.id,
                'patient_phone': app.patient.phone,
                'patient_age': app.patient.age,
                'patient_gender': app.patient.gender,
                'date': app.date.strftime('%Y-%m-%d'),
                'time': app.time.strftime('%H:%M'),
                'type': app.type,
                'status': app.status,
                'paid': app.paid,
                'reason': "Ayurvedic Consultation"
            })
            
        return Response({
            'doctor_name': doctor.name,
            'specialization': doctor.specialization,
            'stats': {
                'today_appointments': today_appointments.count(),
                'pending_consultations': pending_consultations.count(),
                'patients_treated': total_patients,
                'daily_earnings': f"₹{today_earnings}"
            },
            'appointments': appointments_list,
            'consultations': [a for a in appointments_list if a['date'] == today.strftime('%Y-%m-%d')]
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def update_appointment_status(request):
    try:
        data = request.data
        appointment_id = data.get('id')
        status = data.get('status') # 'SCHEDULED' or 'CANCELLED'
        
        appointment = Appointment.objects.get(id=appointment_id)
        appointment.status = status
        appointment.save()
        
        return Response({'message': f'Appointment {status.lower()} successfully!'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_diet_plan(request):
    try:
        data = request.data
        doctor_email = data.get('doctor_email')
        patient_id = data.get('patient_id')
        
        doctor = User.objects.get(username=doctor_email).doctor_profile
        patient = PatientProfile.objects.get(id=patient_id)
        
        # Deactivate previous plans for this patient
        DietPlan.objects.filter(patient=patient, is_active=True).update(is_active=False)
        
        plan = DietPlan.objects.create(
            doctor=doctor,
            patient=patient,
            title=data.get('title'),
            duration_days=data.get('duration_days'),
            general_instructions=data.get('general_instructions', ''),
            restrictions=data.get('restrictions', ''),
            is_active=True
        )
        
        days_data = data.get('days', [])
        for day in days_data:
            DietDay.objects.create(
                diet_plan=plan,
                day_number=day.get('day_number'),
                morning_meal=day.get('morning_meal'),
                afternoon_meal=day.get('afternoon_meal'),
                evening_meal=day.get('evening_meal')
            )
            
        return Response({'message': 'Diet plan created successfully!', 'id': plan.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_doctor_diet_plans(request):
    """List all diet plans created by a doctor."""
    try:
        email = request.GET.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        doctor = User.objects.get(username=email).doctor_profile
        plans = DietPlan.objects.filter(doctor=doctor).order_by('-created_at')
        data = []
        for p in plans:
            days = [
                {
                    'id': d.id,
                    'day_number': d.day_number,
                    'morning_meal': d.morning_meal,
                    'afternoon_meal': d.afternoon_meal,
                    'evening_meal': d.evening_meal,
                } for d in p.days.order_by('day_number')
            ]
            data.append({
                'id': p.id,
                'title': p.title,
                'patient_name': p.patient.user.first_name or p.patient.user.username,
                'patient_id': p.patient.id,
                'duration_days': p.duration_days,
                'general_instructions': p.general_instructions,
                'restrictions': p.restrictions,
                'is_active': p.is_active,
                'created_at': p.created_at.strftime('%b %d, %Y'),
                'days': days,
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([permissions.AllowAny])
def delete_diet_plan(request, plan_id):
    """Delete a diet plan by ID."""
    try:
        plan = DietPlan.objects.get(id=plan_id)
        plan.delete()
        return Response({'message': 'Diet plan deleted successfully.'})
    except DietPlan.DoesNotExist:
        return Response({'error': 'Diet plan not found.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([permissions.AllowAny])
def update_diet_plan(request, plan_id):
    """Update a diet plan's title, instructions, and daily meals."""
    try:
        plan = DietPlan.objects.get(id=plan_id)
        data = request.data
        plan.title = data.get('title', plan.title)
        plan.general_instructions = data.get('general_instructions', plan.general_instructions)
        plan.restrictions = data.get('restrictions', plan.restrictions)
        plan.is_active = data.get('is_active', plan.is_active)
        plan.save()

        # Update individual days
        for day_data in data.get('days', []):
            day_id = day_data.get('id')
            if day_id:
                try:
                    day = DietDay.objects.get(id=day_id, diet_plan=plan)
                    day.morning_meal = day_data.get('morning_meal', day.morning_meal)
                    day.afternoon_meal = day_data.get('afternoon_meal', day.afternoon_meal)
                    day.evening_meal = day_data.get('evening_meal', day.evening_meal)
                    day.save()
                except DietDay.DoesNotExist:
                    pass

        return Response({'message': 'Diet plan updated successfully.'})
    except DietPlan.DoesNotExist:
        return Response({'error': 'Diet plan not found.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_doctor_patients(request):
    """Get all unique patients who have had appointments with this doctor."""
    try:
        email = request.GET.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        doctor = User.objects.get(username=email).doctor_profile

        # Get all unique patients via appointments
        appointments = Appointment.objects.filter(doctor=doctor).select_related('patient', 'patient__user').order_by('-date')
        seen = set()
        patients_data = []

        for app in appointments:
            patient = app.patient
            if patient.id in seen:
                continue
            seen.add(patient.id)

            # All appointments for this patient with this doctor
            patient_apps = Appointment.objects.filter(doctor=doctor, patient=patient).order_by('-date')
            last_visit = patient_apps.first()
            prescription_count = Prescription.objects.filter(appointment__doctor=doctor, appointment__patient=patient).count()

            patients_data.append({
                'id': patient.id,
                'name': patient.user.first_name or patient.user.username,
                'email': patient.user.email,
                'phone': patient.phone,
                'age': patient.age,
                'gender': patient.gender,
                'dosha': patient.dosha_type or 'Not assessed',
                'image': patient.image,
                'total_visits': patient_apps.count(),
                'prescription_count': prescription_count,
                'last_visit_date': last_visit.date.strftime('%b %d, %Y') if last_visit else 'N/A',
                'last_visit_status': last_visit.status if last_visit else 'N/A',
                'appointments': [
                    {
                        'id': a.id,
                        'date': a.date.strftime('%b %d, %Y'),
                        'time': a.time.strftime('%H:%M'),
                        'type': a.type,
                        'status': a.status,
                    }
                    for a in patient_apps
                ]
            })

        return Response(patients_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_patient_diet_plan(request):
    try:
        email = request.GET.get('email')
        user = User.objects.get(username=email)
        patient = user.patient_profile
        
        plan = DietPlan.objects.filter(patient=patient, is_active=True).first()
        if not plan:
            return Response({'message': 'No active diet plan found.'}, status=404)
            
        serializer = DietPlanSerializer(plan)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    try:
        data = request.data
        if not data.get('email') or not data.get('password'):
             return Response({'error': 'Email and Password are required.'}, status=400)
             
        if User.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Email already exists'}, status=400)
        
        user = User.objects.create_user(
            username=data.get('email'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('name', '')
        )
        dummy_phone = "temp_" + str(uuid.uuid4())[:10]
        PatientProfile.objects.create(
            user=user, 
            phone=dummy_phone,
            age=data.get('age'),
            gender=data.get('gender')
        )
        return Response({'message': 'User created successfully', 'username': user.username, 'name': user.first_name})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_appointment(request):
    try:
        data = request.data
        doctor_id = data.get('doctor_id')
        email = data.get('email')
        
        doctor = DoctorProfile.objects.get(id=doctor_id)
        user = User.objects.get(email=email)
        patient = user.patient_profile
        
        # Parse time: "09:00 AM" -> "09:00:00"
        time_str = data.get('time')
        # Simple parsing for the 12h format provided in the frontend
        time_obj = datetime.strptime(time_str, '%I:%M %p').time()
        
        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            date=data.get('date'),
            time=time_obj,
            type=data.get('type', 'ONLINE').upper(),
            status='PENDING',
            paid=False
        )
        return Response({'message': 'Appointment booked successfully!', 'id': appointment.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    data = request.data
    user = authenticate(username=data.get('email'), password=data.get('password'))
    if user is not None:
        role = 'patient'
        if hasattr(user, 'doctor_profile'):
            role = 'doctor'
        else:
            if not hasattr(user, 'patient_profile'):
                PatientProfile.objects.create(user=user, phone="0000000000")
        return Response({
            'message': 'Login successful', 
            'username': user.username, 
            'name': user.first_name,
            'role': role
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_doctor(request):
    try:
        data = request.data
        if not data.get('email') or not data.get('password'):
             return Response({'error': 'Email and Password are required.'}, status=400)
             
        if User.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Email already exists'}, status=400)
        
        user = User.objects.create_user(
            username=data.get('email'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('name', '')
        )
        doctor = DoctorProfile.objects.create(
            user=user,
            name=data.get('name', ''),
            specialization=data.get('specialization', ''),
            experience=data.get('experience', ''),
            bio=data.get('bio', ''),
            consultation_fee=0.00,
            image=data.get('image', '')
        )
        return Response({'message': 'Doctor created successfully!', 'id': doctor.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_admin_stats(request):
    try:
        from django.db.models import Sum
        total_revenue = Appointment.objects.aggregate(total=Sum('doctor__consultation_fee'))['total'] or 0
        chart_data = []
        today_val = date.today()
        for i in range(6, -1, -1):
            day = today_val - timedelta(days=i)
            count = Appointment.objects.filter(date=day).count()
            chart_data.append({
                'name': day.strftime('%a'),
                'appointments': count
            })
        return Response({
            'total_users': PatientProfile.objects.count(),
            'active_doctors': DoctorProfile.objects.count(),
            'total_appointments': Appointment.objects.count(),
            'revenue': f"₹{total_revenue}",
            'chart_data': chart_data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_patient_dashboard(request):
    try:
        email = request.GET.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        
        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
            
        try:
            patient = user.patient_profile
        except:
            patient = PatientProfile.objects.create(user=user, phone="0000000000")

        appointments = Appointment.objects.filter(patient=patient).order_by('date','time')
        apps_data = []
        for app in appointments:
            apps_data.append({
                'id': app.id,
                'doctor': app.doctor.name,
                'specialty': app.doctor.specialization,
                'date': app.date.strftime('%b %d, %Y'),
                'time': app.time.strftime('%H:%M'),
                'type': app.type,
                'status': app.status
            })
            
        # Add Prescriptions
        prescriptions = Prescription.objects.filter(appointment__patient=patient).order_by('-created_at')
        pres_data = []
        for p in prescriptions:
            pres_data.append({
                'id': p.id,
                'doctor_name': p.appointment.doctor.name,
                'date': p.created_at.strftime('%b %d, %Y'),
                'medicines': p.medicines,
                'notes': p.notes,
                'diet_plan': p.diet_plan,
                'lifestyle_tips': p.lifestyle_tips
            })

        return Response({
            'name': user.first_name,
            'dosha': patient.dosha_type or 'Vata-Pitta (Estimate)',
            'appointments': apps_data,
            'prescriptions': pres_data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([permissions.AllowAny])
def patient_profile(request):
    try:
        email = request.GET.get('email') or request.data.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            user = User.objects.get(email=email)
        try:
            patient = user.patient_profile
        except:
            patient = PatientProfile.objects.create(user=user, phone="0000000000")
        if request.method == 'POST':
            data = request.data
            user.first_name = data.get('name', user.first_name)
            user.save()
            patient.phone = data.get('phone', patient.phone)
            patient.age = data.get('age', patient.age)
            patient.gender = data.get('gender', patient.gender)
            patient.image = data.get('image', patient.image)
            patient.save()
            return Response({'message': 'Profile updated successfully'})
        return Response({
            'name': user.first_name,
            'email': user.email,
            'phone': patient.phone,
            'age': patient.age,
            'gender': patient.gender,
            'image': patient.image,
            'dosha': patient.dosha_type or "Not Set"
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_doctor_prescriptions(request):
    try:
        email = request.GET.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        
        user = User.objects.get(username=email)
        doctor = user.doctor_profile
        
        prescriptions = Prescription.objects.filter(appointment__doctor=doctor).order_by('-created_at')
        data = []
        for p in prescriptions:
            data.append({
                'id': p.id,
                'patient_name': p.appointment.patient.user.first_name,
                'date': p.created_at.strftime('%b %d, %Y'),
                'medicines': p.medicines,
                'notes': p.notes
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_prescription(request):
    try:
        data = request.data
        appointment_id = data.get('appointment_id')
        appointment = Appointment.objects.get(id=appointment_id)
        
        prescription, created = Prescription.objects.update_or_create(
            appointment=appointment,
            defaults={
                'notes': data.get('notes', ''),
                'medicines': data.get('medicines', []),
                'diet_plan': data.get('diet_plan', []),
                'lifestyle_tips': data.get('lifestyle_tips', [])
            }
        )
        return Response({'message': 'Prescription saved successfully!', 'id': prescription.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def doctor_profile_api(request):
    try:
        email = request.GET.get('email') or request.data.get('email')
        if not email: return Response({'error': 'Email required'}, status=400)
        
        user = User.objects.get(username=email)
        doctor = user.doctor_profile
        
        if request.method == 'POST':
            data = request.data
            user.first_name = data.get('name', user.first_name)
            user.save()
            
            doctor.name = data.get('name', doctor.name)
            doctor.specialization = data.get('specialization', doctor.specialization)
            doctor.experience = data.get('experience', doctor.experience)
            doctor.bio = data.get('bio', doctor.bio)
            doctor.image = data.get('image', doctor.image)
            doctor.consultation_fee = data.get('consultation_fee', doctor.consultation_fee)
            doctor.save()
            return Response({'message': 'Doctor profile updated successfully'})
            
        return Response({
            'name': doctor.name,
            'email': user.email,
            'specialization': doctor.specialization,
            'experience': doctor.experience,
            'bio': doctor.bio,
            'image': doctor.image,
            'consultation_fee': doctor.consultation_fee
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]

class PatientViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.AllowAny]

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.AllowAny]

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.AllowAny]

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.AllowAny]

# ─── Doctor Profile GET / UPDATE ───────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def doctor_profile_api(request):
    email = request.GET.get('email') or request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=400)
    try:
        user = User.objects.get(username=email)
        doctor = user.doctor_profile
    except Exception:
        return Response({'error': 'Doctor not found'}, status=404)

    if request.method == 'GET':
        return Response({
            'name':             doctor.name,
            'specialization':   doctor.specialization,
            'bio':              doctor.bio,
            'experience':       doctor.experience,
            'consultation_fee': str(doctor.consultation_fee),
            'rating':           doctor.rating,
            'image':            doctor.image or '',
        })

    # POST — update profile
    data = request.data
    doctor.name             = data.get('name',           doctor.name)
    doctor.specialization   = data.get('specialization', doctor.specialization)
    doctor.bio              = data.get('bio',            doctor.bio)
    doctor.experience       = data.get('experience',     doctor.experience)
    doctor.consultation_fee = data.get('consultation_fee', doctor.consultation_fee)
    if data.get('image'):
        doctor.image = data.get('image')
    doctor.save()

    # Also update first_name on User model
    if data.get('name'):
        user.first_name = data.get('name')
        user.save()

    return Response({'message': 'Profile updated successfully!'})


# ─── Razorpay Payment ──────────────────────────────────────────────────────────
# 🔑 Paste your keys from: Razorpay Dashboard → Settings → API Keys
# Use rzp_test_* keys for testing, rzp_live_* for production
RAZORPAY_KEY_ID     = 'rzp_test_SevnAEhgnCQigF'   # ✅ Test Key ID
RAZORPAY_KEY_SECRET = 'qZQvBAgsYJ7DXn7yqacYOaFm'     # ← Copy full secret from Razorpay dashboard

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_razorpay_order(request):
    """
    Creates a Razorpay order and saves a PENDING appointment.
    Returns: { order_id, amount, currency, appointment_id, key_id }
    """
    try:
        import razorpay
        data = request.data
        email = data.get('email')
        doctor_id = data.get('doctor_id')

        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            return Response({'error': f'No user found with email: {email}'}, status=400)

        # Auto-create PatientProfile if missing (handles legacy accounts)
        patient, _ = PatientProfile.objects.get_or_create(
            user=user,
            defaults={
                'phone': data.get('phone', '0000000000'),
                'age': None,
                'gender': ''
            }
        )

        # Update phone if provided
        if data.get('phone') and patient.phone == '0000000000':
            patient.phone = data.get('phone')
            patient.save()

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({'error': f'Doctor ID {doctor_id} not found'}, status=400)

        # Amount in paise (1 INR = 100 paise)
        amount_paise = int(float(doctor.consultation_fee) * 100)

        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'payment_capture': 1,
            'notes': {
                'doctor': doctor.name,
                'patient': user.first_name,
            }
        })

        # Parse time properly
        time_str = data.get('time', '09:00').split('-')[0].strip()
        try:
            time_obj = datetime.strptime(time_str, '%I:%M %p').time()
        except ValueError:
            time_obj = datetime.strptime(time_str, '%H:%M').time()

        # Create appointment (unpaid until payment verified)
        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            date=data.get('date'),
            time=time_obj,
            type=data.get('type', 'ONLINE').upper(),
            status='PENDING',
            paid=False,
            razorpay_order_id=order['id'],
        )

        return Response({
            'order_id': order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'appointment_id': appointment.id,
            'key_id': RAZORPAY_KEY_ID,
            'doctor_name': doctor.name,
            'patient_name': user.first_name,
            'patient_email': email,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_razorpay_payment(request):
    """
    Verifies Razorpay payment signature and marks appointment as paid.
    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_id }
    """
    try:
        import razorpay, hmac, hashlib
        data = request.data
        order_id   = data.get('razorpay_order_id')
        payment_id = data.get('razorpay_payment_id')
        signature  = data.get('razorpay_signature')

        # HMAC-SHA256 verification
        expected = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            f'{order_id}|{payment_id}'.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected != signature:
            return Response({'error': 'Invalid payment signature'}, status=400)

        # Mark appointment paid
        appointment = Appointment.objects.get(id=data.get('appointment_id'))
        appointment.paid = True
        appointment.status = 'PENDING'   # Doctor still needs to confirm
        appointment.save()

        # Mark corresponding time slot as booked
        try:
            slot = TimeSlot.objects.get(
                doctor=appointment.doctor,
                date=appointment.date,
                start_time=appointment.time
            )
            slot.is_booked = True
            slot.save()
        except TimeSlot.DoesNotExist:
            pass


        return Response({'message': 'Payment verified. Appointment confirmed!', 'appointment_id': appointment.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ─── JaaS JWT Generator ────────────────────────────────────────────────────────
JAAS_APP_ID = 'vpaas-magic-cookie-f62a2e094e674e9d84405cd6fb8ca1d4'
JAAS_KEY_ID  = f'{JAAS_APP_ID}/f6b15e-SAMPLE_APP'

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def generate_jaas_jwt(request):
    try:
        import jwt as pyjwt
        from django.conf import settings

        email = request.GET.get('email', '')
        name  = request.GET.get('name', 'User')
        role  = request.GET.get('role', 'patient')

        now_ts = int(time_module.time())
        payload = {
            'aud': 'jitsi', 'iss': 'chat',
            'iat': now_ts, 'exp': now_ts + 7200, 'nbf': now_ts - 5,
            'sub': JAAS_APP_ID,
            'context': {
                'features': {
                    'livestreaming': True, 'file-upload': True,
                    'outbound-call': True, 'sip-outbound-call': False,
                    'transcription': True, 'list-visitors': False,
                    'recording': True, 'flip': False,
                },
                'user': {
                    'hidden-from-recorder': False,
                    'moderator': role == 'doctor',
                    'name': name, 'id': email, 'avatar': '', 'email': email,
                }
            },
            'room': '*',
        }

        private_key = getattr(settings, 'JAAS_PRIVATE_KEY', None)
        if not private_key:
            raise ValueError('JAAS_PRIVATE_KEY not set in settings.')

        token = pyjwt.encode(payload, private_key, algorithm='RS256', headers={'kid': JAAS_KEY_ID})
        return Response({'jwt': token})
    except ImportError:
        return Response({'jwt': _JAAS_DEMO_JWT, 'warning': 'PyJWT not installed.'})
    except Exception as e:
        return Response({'jwt': _JAAS_DEMO_JWT, 'warning': str(e)})

_JAAS_DEMO_JWT = (
    'eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtZjYyYTJlMDk0ZTY3NGU5ZDg0NDA1Y2Q2ZmI4Y2ExZDQv'
    'ZjZiMTVlLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIs'
    'Imlzcyh6ImNoYXQiLCJpYXQiOjE3NzY1MDQ1NjUsImV4cCI6MTc3NjUxMTc2NSwibmJmIjoxNzc2NTA0NTYw'
    'LCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtZjYyYTJlMDk0ZTY3NGU5ZDg0NDA1Y2Q2ZmI4Y2ExZDQiLCJj'
    'b250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsImZpbGUtdXBsb2FkIjp0cnVlLCJv'
    'dXRib3VuZC1jYWxsIjp0cnVlLCJzaXAtb3V0Ym91bmQtY2FsbCI6ZmFsc2UsInRyYW5zY3JpcHRpb24iOnRy'
    'dWUsImxpc3QtdmlzaXRvcnMiOmZhbHNlLCJyZWNvcmRpbmciOnRydWUsImZsaXAiOmZhbHNlfSwidXNlciI6'
    'eyJoaWRkZW4tZnJvbS1yZWNvcmRlciI6ZmFsc2UsIm1vZGVyYXRvciI6dHJ1ZSwibmFtZSI6InNoYWhpbnNo'
    'YWppMjM5IiwiaWQiOiJnb29nbGUtb2F1dGgyfDExNjAzNTU4OTk1NzYxNjM2NDM5MSIsImF2YXRhciI6IiIs'
    'ImVtYWlsIjoic2hhaGluc2hhamkyMzlAZ21haWwuY29tIn19LCJyb29tIjoiKiJ9.RmWMgh_FRlN2mHJyVTRl'
    'sK8BVqpjNL3kufLoJLbFWMzWXMiqOnEOxpEcKLWBsU2pTOJtisQpdUGXnQdEumj0GkMTWtCymFEy5BK8B4Ft'
    '0QzR2MJdrKDF6m0xRC4KziwMenjuN1tfL5tvXQNu2IJj-A4Y72jXs-neVjJhnknK0ADSv_bpW_YvqEg1FnrXp'
    'E5yxYT88FhpciCOio2iGntdCDungsvwBL3TITK5yKBC6TDHhRnPBx_KJ24thVEgXKGEN9qVVg-cM-eBvE9jpx'
    'UluU895mDh4esl9Ysx2kLiBd-Ov0HbvRWNN-LqyKT5ohjDJzmV4pfQxqnieZq0hyx4vw'
)
# For production: store JAAS_PRIVATE_KEY in environment / settings.
# The key is the RS256 private key downloaded from your JaaS dashboard.
JAAS_APP_ID = 'vpaas-magic-cookie-f62a2e094e674e9d84405cd6fb8ca1d4'
JAAS_KEY_ID  = f'{JAAS_APP_ID}/f6b15e-SAMPLE_APP'   # kid from your JWT header

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def generate_jaas_jwt(request):
    """
    Generate a short-lived JaaS JWT for the given appointment session.
    Called by the frontend before entering the consultation room.
    """
    try:
        import jwt as pyjwt
        from django.conf import settings

        email = request.GET.get('email', '')
        name  = request.GET.get('name', 'User')
        role  = request.GET.get('role', 'patient')

        now_ts = int(time_module.time())
        payload = {
            'aud': 'jitsi',
            'iss': 'chat',
            'iat': now_ts,
            'exp': now_ts + 7200,          # 2 hours
            'nbf': now_ts - 5,
            'sub': JAAS_APP_ID,
            'context': {
                'features': {
                    'livestreaming':       True,
                    'file-upload':         True,
                    'outbound-call':       True,
                    'sip-outbound-call':   False,
                    'transcription':       True,
                    'list-visitors':       False,
                    'recording':           True,
                    'flip':                False,
                },
                'user': {
                    'hidden-from-recorder': False,
                    'moderator': role == 'doctor',
                    'name': name,
                    'id': email,
                    'avatar': '',
                    'email': email,
                }
            },
            'room': '*',
        }

        private_key = getattr(settings, 'JAAS_PRIVATE_KEY', None)
        if not private_key:
            raise ValueError('JAAS_PRIVATE_KEY not set in settings.')

        token = pyjwt.encode(
            payload,
            private_key,
            algorithm='RS256',
            headers={'kid': JAAS_KEY_ID}
        )
        return Response({'jwt': token})

    except ImportError:
        # PyJWT not installed — return static demo token
        return Response({'jwt': _JAAS_DEMO_JWT, 'warning': 'PyJWT not installed. Using demo token.'})
    except Exception as e:
        # Key not configured — return static demo token
        return Response({'jwt': _JAAS_DEMO_JWT, 'warning': str(e)})

# Static fallback token (2-hour TTL, refreshed manually from JaaS dashboard)
_JAAS_DEMO_JWT = (
    'eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtZjYyYTJlMDk0ZTY3NGU5ZDg0NDA1Y2Q2ZmI4Y2ExZDQv'
    'ZjZiMTVlLVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIs'
    'Imlzcyh6ImNoYXQiLCJpYXQiOjE3NzY1MDQ1NjUsImV4cCI6MTc3NjUxMTc2NSwibmJmIjoxNzc2NTA0NTYw'
    'LCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtZjYyYTJlMDk0ZTY3NGU5ZDg0NDA1Y2Q2ZmI4Y2ExZDQiLCJj'
    'b250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOnRydWUsImZpbGUtdXBsb2FkIjp0cnVlLCJv'
    'dXRib3VuZC1jYWxsIjp0cnVlLCJzaXAtb3V0Ym91bmQtY2FsbCI6ZmFsc2UsInRyYW5zY3JpcHRpb24iOnRy'
    'dWUsImxpc3QtdmlzaXRvcnMiOmZhbHNlLCJyZWNvcmRpbmciOnRydWUsImZsaXAiOmZhbHNlfSwidXNlciI6'
    'eyJoaWRkZW4tZnJvbS1yZWNvcmRlciI6ZmFsc2UsIm1vZGVyYXRvciI6dHJ1ZSwibmFtZSI6InNoYWhpbnNo'
    'YWppMjM5IiwiaWQiOiJnb29nbGUtb2F1dGgyfDExNjAzNTU4OTk1NzYxNjM2NDM5MSIsImF2YXRhciI6IiIs'
    'ImVtYWlsIjoic2hhaGluc2hhamkyMzlAZ21haWwuY29tIn19LCJyb29tIjoiKiJ9.RmWMgh_FRlN2mHJyVTRl'
    'sK8BVqpjNL3kufLoJLbFWMzWXMiqOnEOxpEcKLWBsU2pTOJtisQpdUGXnQdEumj0GkMTWtCymFEy5BK8B4Ft'
    '0QzR2MJdrKDF6m0xRC4KziwMenjuN1tfL5tvXQNu2IJj-A4Y72jXs-neVjJhnknK0ADSv_bpW_YvqEg1FnrXp'
    'E5yxYT88FhpciCOio2iGntdCDungsvwBL3TITK5yKBC6TDHhRnPBx_KJ24thVEgXKGEN9qVVg-cM-eBvE9jpx'
    'UluU895mDh4esl9Ysx2kLiBd-Ov0HbvRWNN-LqyKT5ohjDJzmV4pfQxqnieZq0hyx4vw'
)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_doctor_slots(request):
    try:
        doctor_id = request.GET.get('doctor_id')
        date_str = request.GET.get('date')
        if not doctor_id:
            email = request.GET.get('email')
            if email:
                doctor_id = User.objects.get(username=email).doctor_profile.id
            else:
                return Response({'error': 'doctor_id or email required'}, status=400)
        
        slots = TimeSlot.objects.filter(doctor_id=doctor_id)
        if date_str:
            slots = slots.filter(date=date_str)
            
        slots = slots.order_by('date', 'start_time')
        data = [{
            'id': s.id,
            'date': s.date.strftime('%Y-%m-%d'),
            'start_time': s.start_time.strftime('%H:%M:%S'),
            'end_time': s.end_time.strftime('%H:%M:%S') if s.end_time else None,
            'is_booked': s.is_booked
        } for s in slots]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def add_doctor_slot(request):
    try:
        data = request.data
        email = data.get('email')
        date_str = data.get('date')
        time_str = data.get('start_time')
        end_time_str = data.get('end_time')
        
        doctor = User.objects.get(username=email).doctor_profile
        
        # Check if exists
        time_obj = datetime.strptime(time_str, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time_str, '%H:%M').time() if end_time_str else None
        
        slot, created = TimeSlot.objects.get_or_create(
            doctor=doctor,
            date=date_str,
            start_time=time_obj,
            defaults={'end_time': end_time_obj}
        )
        if not created:
            # Maybe update the end time if it exists?
            slot.end_time = end_time_obj
            slot.save()
            
        return Response({'message': 'Slot added successfully', 'id': slot.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([permissions.AllowAny])
def delete_doctor_slot(request, slot_id):
    try:
        slot = TimeSlot.objects.get(id=slot_id)
        slot.delete()
        return Response({'message': 'Slot deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
