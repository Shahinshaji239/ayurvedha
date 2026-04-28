import requests

BASE = 'https://doctor-ayurvedha-api.onrender.com/api/create-doctor/'

doctors = [
    {
        'name': 'Dr. Priya Nair',
        'email': 'dr.priya@ayursana.com',
        'password': 'Doctor@123',
        'specialization': 'Panchakarma & Detox Specialist',
        'experience': '12 years',
        'bio': 'Expert in classical Panchakarma therapies, Shirodhara, and Ayurvedic detoxification. Trained at Kerala Ayurveda Academy.',
        'image': 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        'name': 'Dr. Arjun Menon',
        'email': 'dr.arjun@ayursana.com',
        'password': 'Doctor@123',
        'specialization': 'Kayachikitsa (Internal Medicine)',
        'experience': '15 years',
        'bio': 'Specialist in chronic disease management through Ayurveda. Expert in Rasayana therapy and herbal formulations for lifestyle disorders.',
        'image': 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        'name': 'Dr. Meera Krishnan',
        'email': 'dr.meera@ayursana.com',
        'password': 'Doctor@123',
        'specialization': 'Streeroga & Prasuti Tantra',
        'experience': '10 years',
        'bio': 'Specializes in women health, fertility treatments, and prenatal Ayurvedic care. Expert in hormone balancing through natural therapies.',
        'image': 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
        'name': 'Dr. Rahul Varma',
        'email': 'dr.rahul@ayursana.com',
        'password': 'Doctor@123',
        'specialization': 'Marma & Neurological Disorders',
        'experience': '8 years',
        'bio': 'Expert in Marma therapy, Nasya, and Ayurvedic treatment for neurological conditions including stress, anxiety, and migraine.',
        'image': 'https://randomuser.me/api/portraits/men/75.jpg'
    },
    {
        'name': 'Dr. Lakshmi Iyer',
        'email': 'dr.lakshmi@ayursana.com',
        'password': 'Doctor@123',
        'specialization': 'Ayurvedic Dermatology & Skin Care',
        'experience': '9 years',
        'bio': 'Specialist in skin conditions like psoriasis, eczema and acne through Ayurvedic herbs and Raktamokshana therapy.',
        'image': 'https://randomuser.me/api/portraits/women/90.jpg'
    },
]

for doc in doctors:
    r = requests.post(BASE, json=doc)
    data = r.json()
    if r.status_code == 200:
        print(f"Created: {doc['name']}")
    else:
        print(f"Failed:  {doc['name']} -- {data}")
