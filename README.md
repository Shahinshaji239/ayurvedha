# AyurSana - Doctor Ayurvedha Platform

A modern platform for Ayurvedic doctor consultations, featuring real-time appointment scheduling, video/chat consultation rooms, diet plan management, and a comprehensive dashboard for doctors, patients, and admins.

## Prerequisites
- Node.js (v18+ recommended)
- Python (v3.10+ recommended)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Backend Setup (Django)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment (Windows):
   ```bash
   .\venv\Scripts\activate
   ```
   *(On macOS/Linux, use `source venv/bin/activate`)*

3. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   The backend API will run at `http://127.0.0.1:8000/`.

### 2. Frontend Setup (React + Vite)

1. Open a **new** terminal and navigate to the project root directory:
   ```bash
   # Make sure you are in the Doctor_ayurvedha directory
   ```

2. Install the necessary NPM packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## 🛠️ Tech Stack
- **Frontend**: React, Vite, CSS
- **Backend**: Python, Django, Django REST Framework
- **Database**: SQLite (default for development)

## 🌟 Key Features
- **Doctor Dashboard**: Manage profiles, consultation fees, calendar, and appointments.
- **Patient Dashboard**: Book appointments, view diet plans, and access consultation history.
- **Consultation Room**: Real-time chat and video functionality.
- **Diet & Prescription Management**: Assign dynamic diet plans and track patient treatment history.
- **Payment Integration**: Razorpay integration for secure transactions.
