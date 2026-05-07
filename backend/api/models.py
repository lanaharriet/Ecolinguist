from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=255, blank=True, null=True)
    crops = models.CharField(max_length=512, blank=True, null=True, help_text="Comma-separated list of crops")
    
    # Enhanced Profile Fields
    farmer_type = models.CharField(max_length=100, blank=True, null=True)
    land_size = models.FloatField(blank=True, null=True, help_text="Land size in acres")
    main_crops = models.CharField(max_length=255, blank=True, null=True)
    irrigation_type = models.CharField(max_length=100, blank=True, null=True)
    income_range = models.CharField(max_length=100, blank=True, null=True)
    preferred_language = models.CharField(max_length=50, default='English')
    farming_experience = models.IntegerField(blank=True, null=True, help_text="Years of experience")

    def __str__(self):
        return f"{self.user.username}'s Profile"

class ClimateReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='climate_reports')
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    parsed_content = models.TextField(blank=True, null=True)
    vector_id = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"{self.file_name} uploaded by {self.user.username}"

class ImageAnalysisResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='image_analyses')
    image = models.ImageField(upload_to='crop_images/', blank=True, null=True)
    crop_detected = models.CharField(max_length=100, blank=True, null=True)
    health_status = models.CharField(max_length=100, blank=True, null=True)
    diseases_detected = models.TextField(blank=True, null=True)
    ai_recommendation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_detected} analysis for {self.user.username}"

class CropReport(models.Model):
    STATUS_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Moderate', 'Moderate'),
        ('Poor', 'Poor')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    crop_type = models.CharField(max_length=100)
    user_condition_input = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    issues_identified = models.TextField()
    recommendations = models.TextField()
    step_by_step_guidance = models.TextField()
    loss_prediction = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_type} Report - {self.created_at.strftime('%Y-%m-%d')}"

class Scheme(models.Model):
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=100, blank=True, null=True, help_text="Applicable region")
    crop = models.CharField(max_length=100, blank=True, null=True, help_text="Applicable crop")
    target_farmer_type = models.CharField(max_length=100, blank=True, null=True)
    max_land_size = models.FloatField(blank=True, null=True)
    benefits = models.TextField()
    eligibility = models.TextField()
    how_to_apply = models.TextField()

    def __str__(self):
        return self.title

class Resource(models.Model):
    TYPE_CHOICES = [
        ('Seed Shop', 'Seed Shop'),
        ('Fertilizer Store', 'Fertilizer Store'),
        ('Pesticide Supplier', 'Pesticide Supplier'),
    ]
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.type})"
