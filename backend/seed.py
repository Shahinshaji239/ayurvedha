import os
import django
import sys

# Setup django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import DoctorProfile, Blog

def seed_data():
    # 1. Create superuser if not exists
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Superuser created: admin / admin123")

    # 2. Create Doctors
    doctors = [
        { 'name': 'Dr. Aarav Sharma', 'spec': 'Panchakarma Expert', 'fee': 1000, 'exp': '15+ Years', 'rating': 4.9 },
        { 'name': 'Dr. Priya Nair', 'spec': 'Yoga & Lifestyle', 'fee': 800, 'exp': '12+ Years', 'rating': 4.8 },
        { 'name': 'Dr. Siddharth Rao', 'spec': 'Chronic Ailments', 'fee': 1500, 'exp': '20+ Years', 'rating': 5.0 },
    ]

    for d in doctors:
        u, _ = User.objects.get_or_create(username=d['name'].replace(' ', '_').lower())
        DoctorProfile.objects.update_or_create(
            user=u,
            defaults={
                'name': d['name'],
                'specialization': d['spec'],
                'consultation_fee': d['fee'],
                'experience': d['exp'],
                'rating': d['rating'],
                'bio': f"Expert in {d['spec']} with a passion for holistic healing.",
                'image': f"https://i.pravatar.cc/150?u={u.id}"
            }
        )
    print("Doctors seeded.")

    # 3. Create Blogs
    blogs = [
        { 'title': 'The Power of Panchakarma', 'slug': 'power-of-panchakarma' },
        { 'title': 'Ayurvedic Diet for Better Sleep', 'slug': 'ayurveda-sleep-diet' }
    ]
    admin = User.objects.get(username='admin')
    for b in blogs:
        Blog.objects.update_or_create(
            slug=b['slug'],
            defaults={
                'title': b['title'],
                'content': f"Detailed article about {b['title']}... coming soon.",
                'author': admin,
                'thumbnail': "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80"
            }
        )
    print("Blogs seeded.")

if __name__ == '__main__':
    seed_data()
