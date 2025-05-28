from django.db import models
from django.forms.models import model_to_dict

# Create your models here.
import uuid
class Games(models.Model):
    game_id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False)
    player_one = models.ForeignKey("users.Users", on_delete=models.PROTECT, related_name='games_as_player_one')
    player_one_cps = models.FloatField(default=0)
    player_two = models.ForeignKey("users.Users", on_delete=models.PROTECT, null=True, related_name='games_as_player_two')
    player_two_cps = models.FloatField(default=0, null=True)
    winning_player = models.ForeignKey("users.Users", on_delete=models.PROTECT, null=True, related_name='games_as_winner')
    timestamp = models.DateTimeField(auto_now_add=True)
    mode = models.CharField(max_length=150, blank=True, null=True)
    active = models.BooleanField(default=False)

    def __str__(self):
        return str(model_to_dict(self))