from django.shortcuts import render
from django.core.paginator import Paginator
from users.models import Users
import json

# Create your views here.


def users_list(request):
    # uses django pagination to send the page and the users on said page.
    users = Users.objects.all().order_by('-top_cps').values("id",'username', 'flag_emoji', 'avatar', 'top_cps')
    paginator = Paginator(users, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    users_json = json.dumps(list(page_obj))
    return render(request, 'leaderboards/leaderboard.html', {
        'page_obj': page_obj,
        'users_json': users_json,
    })