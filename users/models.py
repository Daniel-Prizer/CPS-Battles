from django.db import models
from django.forms.models import model_to_dict
from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):
    top_cps = models.FloatField(default=0)
    top_cps_game_id = models.OneToOneField("Games", on_delete=models.SET_NULL, null=True, blank=True)
    iso2_code = models.CharField(max_length=2, blank=True, null=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    banner = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    first_name = None
    last_name = None

    def __str__(self):
        return str(model_to_dict(self))
    
    class Meta:
        ordering = ["-top_cps"]
    
class Games(models.Model):
    game_id = models.AutoField(primary_key=True)
    player_one = models.ForeignKey(Users, on_delete=models.PROTECT, related_name='games_as_player_one')
    player_one_cps = models.FloatField(default=0)
    player_two = models.ForeignKey(Users, on_delete=models.PROTECT, null=True, related_name='games_as_player_two')
    player_two_cps = models.FloatField(default=0, null=True)
    winning_player = models.ForeignKey(Users, on_delete=models.PROTECT, null=True, related_name='games_as_winner')
    timestamp = models.DateTimeField(auto_now_add=True)
    mode = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return str(model_to_dict(self))
