<img src="static/images/cps_battles.png" alt="CPS Battles Logo" width="450"/>
This project requires pip packages listed in requirements.txt, 
please use pip to install them: pip install -r requirements.txt
^^ It is recommended that you use a python virtual environment.
If you are missing pip, please follow the instructions here: https://pip.pypa.io/en/stable/installation/

Folders with large amounts of images are gitignored to not consume cloud space,
thus to get flag emojis to work, please download the svg folder from: https://github.com/twitter/twemoji/tree/master/assets
and place it here: .../static/twemoji/svg

The project uses a postgres database to run, please create one and configure CPS_Battles/settings.py properly.
Then to set the database up; delete all of the migration files except __init__.py and run the following commands in the repository folder:
python manage.py makemigrations
python manage.py migrate


## Web App Showcase
If I am not currently hosting the website or you don't want to set it up yourself,
please have a look at what it is supposed to look like:

##### Homepage
Click the big button to test your speed, 
the record at the bottom will save your highest speed across the whole website as long as you are logged in!
![Homepage video](Readme%20gifs/Homepage%20gif.gif)


##### Game
To join a lobby, click the "Play with friends" button on the homepage.
Then share the link with your friend and select your game mode. When ready press start!
![Lobby creation video](Readme%20gifs/Session%20gif.gif)
Wait for the countdown and start clicking!
![Gameplay video](Readme%20gifs/Gameplay%20gif.gif)


##### Profile
On your profile you can add an avatar, banner and bio to your liking. 
You can also see your game history at the bottom.
![Profile view video](Readme%20gifs/Profile%20gif.gif)


##### Leaderboards
On the leaderboard you can see which players have clicked the fastest.
Click on any username to see their profile and game history.
![Leaderboards video](Readme%20gifs/Leaderboards%20gif.gif)