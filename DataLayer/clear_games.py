from games.models import Games
from users.models import Users
for user in Users.objects.all():
    user.top_cps_game_id = None
    user.save(update_fields=["top_cps_game_id"])
    print("top_cps_game_id deleted for user",user.id)

for game in Games.objects.all():
    print(game.game_id, "deleted")
    game.delete()
