import requests

# Update consultation fees via doctor-profile API
doctor_fees = [
    ('dr.priya@ayursana.com', 500),
    ('dr.arjun@ayursana.com', 700),
    ('dr.meera@ayursana.com', 600),
    ('dr.rahul@ayursana.com', 550),
    ('dr.lakshmi@ayursana.com', 650),
    ('punit@ayursana.com', 500),
    ('syamlal@ayursana.com', 500),
]

BASE = 'https://doctor-ayurvedha-api.onrender.com/api/doctor-profile/'

for email, fee in doctor_fees:
    r = requests.post(BASE, json={'email': email, 'consultation_fee': fee})
    if r.status_code == 200:
        print(f"Updated {email} fee to Rs {fee}")
    else:
        print(f"Failed {email}: {r.text}")
