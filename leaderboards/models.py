from django.db import models
from django.forms.models import model_to_dict

# Create your models here.
class Leaderboard(models.Model):
    user_id = models.OneToOneField("users.Users", on_delete=models.CASCADE, primary_key=True)
    game_id = models.OneToOneField("users.Games", on_delete=models.CASCADE, primary_key=True)

    class Meta:
        ordering = ["-user__top_cps"]

    def __str__(self):
        return str(model_to_dict(self))
    