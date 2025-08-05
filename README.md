<img src="static/images/cps_battles.png" alt="CPS Battles Logo" width="450"/>

## Web App Showcase
[CPSBattles Website](https://cpsbattles.azurewebsites.net/) Active as of 2025
If I am not currently hosting the website or you don't want to set it up yourself,<br/>
please have a look at what it is supposed to look like:<br/>

##### Homepage
Click the big button to test your speed, <br/>
the record at the bottom will save your highest speed across the whole website as long as you are logged in!<br/>
![Homepage video](Readme%20gifs/Homepage%20gif.gif)


##### Game
To join a lobby, click the "Play with friends" button on the homepage.<br/>
Then share the link with your friend and select your game mode. When ready press start!<br/>
![Lobby creation video](Readme%20gifs/Session%20gif.gif)
Wait for the countdown and start clicking!<br/>
![Gameplay video](Readme%20gifs/Gameplay%20gif.gif)


##### Profile
On your profile you can add an avatar, banner and bio to your liking. <br/>
You can also see your game history at the bottom.<br/>
![Profile view video](Readme%20gifs/Profile%20gif.gif)


##### Leaderboards
On the leaderboard you can see which players have clicked the fastest.<br/>
Click on any username to see their profile and game history.<br/>
![Leaderboards video](Readme%20gifs/Leaderboards%20gif.gif)

## Project Report
Please have a read over 'CPS_Battles - Project Report.pdf' if you are interested in the development process! :)

## Local Installation Guide
This project requires pip packages listed in requirements.txt,<br/>
please use pip to install them: pip install -r requirements.txt<br/>
^^ It is recommended that you use a python virtual environment.<br/>
If you are missing pip, please follow the instructions here: https://pip.pypa.io/en/stable/installation/<br/>
<br/>
Folders with large amounts of images are gitignored to not consume cloud space,<br/>
thus to get flag emojis to work (you may not need to do this, i reenabled the twemoji images for the azure server I am using during a certain period), please download the svg folder from: https://github.com/twitter/twemoji/tree/master/assets<br/>
and place it here: .../static/twemoji/svg<br/>
<br/>
The project uses a postgres database to run, please create one and configure CPS_Battles/settings.py properly.<br/>
Then to set the database up:
python manage.py migrate<br/>

settings.py is in your hands. Please configure it correctly based on your use case.