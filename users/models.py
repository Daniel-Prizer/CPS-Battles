from django.db import models
from django.forms.models import model_to_dict
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class Users(AbstractUser):
    username = models.CharField(
        max_length=12,  # Change length here
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[\w.@+-]+$',
                message=''
            ),
        ],
        error_messages={
            "unique": "A user with that username already exists.",
            "max_length": "Usernames can be at most 12 characters."
        },
    )
    top_cps = models.FloatField(default=0)
    top_cps_game_id = models.ForeignKey("games.Games", on_delete=models.SET_NULL, null=True, blank=True)
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

