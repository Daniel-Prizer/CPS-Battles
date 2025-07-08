# CPS-Battles
This project requires pip packages listed in requirements.txt, please use pip to install them: pip install -r requirements.txt
^^ It is recommended that you use a python virtual environment.
If you are missing pip, please follow the instructions here: https://pip.pypa.io/en/stable/installation/

Folders with large amounts of images are gitignored to not consume cloud space,
thus to get flag emojis to work, please download the svg folder from: https://github.com/twitter/twemoji/tree/master/assets
and place it here: .../static/twemoji/svg

The project uses a postgres database to run, please create one and configure CPS_Battles/settings.py properly.
Then to set the database up properly delete all of the migration files except __init__.py and run the following commands on the manage.py file located under the CPS_Battles folder:
python manage.py makemigrations
python manage.py migrate
