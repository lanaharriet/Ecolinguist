import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Scheme, Resource

def seed_data():
    if Scheme.objects.count() == 0:
        Scheme.objects.create(
            title="PM-Kisan Samman Nidhi",
            location="All India",
            crop="All",
            benefits="Rs 6000 per year given in 3 equal installments.",
            eligibility="Small and marginal farmers holding land up to 2 hectares.",
            how_to_apply="1. Keep Aadhaar and bank passbook ready.\n2. Apply via the CSC or pmkisan.gov.in portal."
        )
        Scheme.objects.create(
            title="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            location="All India",
            crop="Varies",
            benefits="Comprehensive insurance cover against crop failure.",
            eligibility="Farmers growing notified crops in notified areas.",
            how_to_apply="1. Contact your nearest bank branch.\n2. Submit crop sowing certificate."
        )

    if Resource.objects.count() == 0:
        Resource.objects.create(
            name="Green Fields Seed Supply",
            type="Seed Shop",
            location="Near Main Market, Village A",
            latitude=28.7041,
            longitude=77.1025
        )
        Resource.objects.create(
            name="Agri-Care Pesticides",
            type="Pesticide Supplier",
            location="Bus Stand Road, Village B",
            latitude=28.7050,
            longitude=77.1000
        )
        Resource.objects.create(
            name="Kisan Fertilizer Hub",
            type="Fertilizer Store",
            location="Opposite Post Office, Village C"
        )
    print("Database seeded with dummy data.")

if __name__ == '__main__':
    seed_data()
