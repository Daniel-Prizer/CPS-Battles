from DataLayer.users_dl import users_dl
from DataLayer.users_dl import games_dl
from typing import Union
from django.core.files.uploadedfile import UploadedFile
class DataLayerAPI:
    def __init__(self) -> None:
        self.users_dl = users_dl()
        self.games_dl = games_dl()

    # READ: When using the DataLayer API functions you will often be receiving exceptions directly from django if your input is bad. 
    # I am often assuming your input is correct (e.g. the user you are editing exists. etc).

    # ------------------------- USERS -------------------------

    def register_user(
        self,
        username: str,
        password: str,
        bio: str="",
        flag_emoji: str="🌐",
    ) -> dict:
        """Registers a new user and returns the created user as a dictionary."""
        return self.users_dl.register_user(
            username,
            bio,
            password,
            flag_emoji,
        )

    def edit_user(self, user_id: int, field: str, replacement: Union[str,UploadedFile,float,int]) -> dict:
        """Updates a specific field of the user with the given ID.
        
        Editable fields: [bio, avatar, banner, top_cps, top_cps_game_id]
        Returns the updated user as a dictionary.
        """
        return self.users_dl.edit_user(user_id, field, replacement)

    def delete_user(self, user_id: int) -> dict:
        """Deletes the user with the given ID and returns the deleted user as a dictionary."""
        return self.users_dl.delete_user(user_id)

    def get_user_by_id(self, user_id: int) -> dict:
        """Retrieves the user with the specified ID as a dictionary."""
        return self.users_dl.get_user_by_id(user_id)

    def get_user_by_username(self, username: str) -> dict:
        """Retrieves the user with the specified username as a dictionary."""
        return self.users_dl.get_user_by_username(username)

    def get_all_users(self) -> list:
        """Returns a list of all users as dictionaries."""
        return self.users_dl.get_all_users()
    
  # ------------------------- Games -------------------------

    def register_game(self,
        player_one: int,
        player_one_cps: float,
        player_two: int,
        player_two_cps: float,
        mode: str,
        active: bool) -> dict:
        """Registers a new game and returns the created game as a dictionary."""
        return self.games_dl.register_game(
            player_one,
            player_one_cps,
            player_two,
            player_two_cps,
            mode,
            active
        )
    
    def edit_game(self, game_id: int, field: str, replacement: Union[int, str, bool]) -> dict:
        """Updates a specific field of the user with the given ID.
        
        Editable fields: 
        [
        player_one_clicks, 
        player_one_cps, 
        player_two, 
        player_two_clicks, 
        player_two_cps, 
        mode, 
        active, 
        started,
        ]
        Returns the updated user as a dictionary.
        """
        return self.games_dl.edit_game(game_id, field, replacement)

    def delete_game(self, game_id: int) -> dict:
        """Deletes the game with the given ID and returns the deleted game as a dictionary."""
        return self.games_dl.delete_game(game_id)
    
    def get_game(self, game_id: int) -> dict:
        """Retrieves the game with the specified ID as a dictionary."""
        return self.games_dl.get_game(game_id)

    def get_games_for_user_id(self, user_id: int) -> list:
        """Retrieves a list of games where the user is a participant."""
        return self.games_dl.get_games_for_user_id(user_id)