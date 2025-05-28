from django.db import models
from django.forms.models import model_to_dict
from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):
    top_cps = models.FloatField(default=0)
    top_cps_game_id = models.OneToOneField("games.Games", on_delete=models.SET_NULL, null=True, blank=True)
    flag_emoji = models.CharField(max_length=2, default="🌐")
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    banner = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    first_name = None
    last_name = None

    def __str__(self):
        return str(model_to_dict(self))
    
    class Meta:
        ordering = ["-top_cps"]

