import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import PatientProfile

for email in ['dijoace@gmail.com', 'shahin.python@gmail.com']:
    try:
        user = User.objects.get(username=email)
        profile, created = PatientProfile.objects.get_or_create(
            user=user,
            defaults={'phone': '0000000000', 'age': None, 'gender': ''}
        )
        print(f'{email}: {"Created" if created else "Already exists"}')
    except User.DoesNotExist:
        print(f'{email}: User not found')

print('Done.')
