from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=255, blank=True, null=True)
    crops = models.CharField(max_length=512, blank=True, null=True, help_text="Comma-separated list of crops")

    def __str__(self):
        return f"{self.user.username}'s Profile"

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
