import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Scheme, Resource

def seed_data():
    # Schemes
    schemes_data = [
        {
            "title": "PM-Kisan Samman Nidhi",
            "location": "All India",
            "crop": "All",
            "target_farmer_type": "Small/Marginal",
            "max_land_size": 5.0,
            "benefits": "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 each every four months.",
            "eligibility": "Small and marginal farmer families having combined land holding/ownership of up to 2 hectares.",
            "how_to_apply": "Apply through PM-Kisan Portal (pmkisan.gov.in) or Common Service Centers (CSC)."
        },
        {
            "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "location": "All India",
            "crop": "Kharif, Rabi, Commercial/Horticultural",
            "target_farmer_type": "All",
            "benefits": "Low premium (1.5% to 5%) and full claim against crop loss due to natural calamities.",
            "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.",
            "how_to_apply": "Apply through banks, insurance companies, or the National Crop Insurance Portal."
        },
        {
            "title": "Kisan Credit Card (KCC)",
            "location": "All India",
            "crop": "All",
            "target_farmer_type": "All",
            "benefits": "Short-term credit for crops and other needs at a low interest rate (effectively 4% after subvention).",
            "eligibility": "All farmers, individuals/joint borrowers, tenant farmers, oral lessees, and sharecroppers.",
            "how_to_apply": "Visit any commercial, regional rural, or cooperative bank branch."
        },
        {
            "title": "Paramparagat Krishi Vikas Yojana (PKVY)",
            "location": "All India",
            "crop": "Organic Crops",
            "target_farmer_type": "Cluster-based",
            "benefits": "Financial assistance of ₹50,000 per hectare for 3 years for organic farming.",
            "eligibility": "Groups of farmers (minimum 20) with total land of 50 acres.",
            "how_to_apply": "Apply through the State Department of Agriculture."
        },
        {
            "title": "PM Krishi Sinchai Yojana (PMKSY)",
            "location": "All India",
            "crop": "All",
            "target_farmer_type": "All",
            "benefits": "Subsidies for micro-irrigation (Drip/Sprinkler) to ensure 'Per Drop More Crop'.",
            "eligibility": "Farmers with access to a water source and land suitable for micro-irrigation.",
            "how_to_apply": "Apply through the district agriculture/horticulture office or online portal."
        },
        {
            "title": "National Mission for Sustainable Agriculture (NMSA)",
            "location": "All India",
            "crop": "Integrated Farming",
            "target_farmer_type": "Small/Marginal Preferred",
            "benefits": "Support for integrated farming systems including livestock, fishery, and agro-forestry.",
            "eligibility": "Focus on small and marginal farmers in rain-fed areas.",
            "how_to_apply": "Contact the Block or District Agriculture Officer."
        },
        {
            "title": "Unified Package Insurance Scheme (UPIS)",
            "location": "Selected Districts",
            "crop": "Notified Crops",
            "target_farmer_type": "All",
            "benefits": "Single insurance cover for crops, personal accident, life, dwelling, and student safety.",
            "eligibility": "Mandatory for loanee farmers, optional for others.",
            "how_to_apply": "Apply via the same channels as PMFBY."
        }
    ]

    for data in schemes_data:
        Scheme.objects.get_or_create(title=data["title"], defaults=data)

    # Resources
    resources_data = [
        {
            "name": "Green Fields Seed Supply",
            "type": "Seed Shop",
            "location": "Near Main Market, Coimbatore",
            "latitude": 11.0168,
            "longitude": 76.9558
        },
        {
            "name": "Agri-Care Pesticides",
            "type": "Pesticide Supplier",
            "location": "Bus Stand Road, Pollachi",
            "latitude": 10.6586,
            "longitude": 77.0093
        },
        {
            "name": "Kisan Fertilizer Hub",
            "type": "Fertilizer Store",
            "location": "Opposite Post Office, Salem",
            "latitude": 11.6643,
            "longitude": 78.1460
        },
        {
            "name": "Tamil Nadu Agro Service Centre",
            "type": "Fertilizer Store",
            "location": "Goundampalayam, Coimbatore",
            "latitude": 11.0335,
            "longitude": 76.9452
        }
    ]

    for data in resources_data:
        Resource.objects.get_or_create(name=data["name"], defaults=data)

    print(f"Database seeded with {Scheme.objects.count()} schemes and {Resource.objects.count()} resources.")

if __name__ == '__main__':
    seed_data()
