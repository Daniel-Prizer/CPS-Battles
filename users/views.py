from django.shortcuts import render
from django.shortcuts import redirect
from DataLayer.API import DataLayerAPI
from django.http import JsonResponse
from django.contrib import messages
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile
import json

api = DataLayerAPI()

# Create your views here.


def user_detail_api(request, user_id):
    # get user
    if request.method == "GET":
        try:
            user = api.get_user_by_id(user_id)
            # send the user images as urls and not whatever object django uses (incompatible with json):
            user['avatar'] = user['avatar'].url if user['avatar'] else ''
            user['banner'] = user['banner'].url if user['banner'] else ''
            return JsonResponse(user)
        except Exception:
            return render(request, '404.html', status=404)
    # edit user
    elif request.method == "POST":
        # make sure that the user_id input isnt being manipulated, only allow editing your own user.
        if int(request.user.id) != int(user_id):
            return JsonResponse({"error": "You can only edit your own user"}, status=403)
        data = json.loads(request.body)
        # expects edit field to be one of the ones listed under api.py
        edit_field = data.get("edit_field")
        edit_replacement = data.get("edit_replacement")
        api.edit_user(user_id, edit_field, edit_replacement)
        return JsonResponse({}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# this view is used specifically for the profile edit
def edit_user(request):
    if request.method == "POST":
        user = request.user

        # Avatar (1:1)
        if 'pfp_upload' in request.FILES:
            avatar = request.FILES['pfp_upload']
            try:
                img = Image.open(avatar)
                img = img.convert('RGB')

                # Crop to square
                width, height = img.size
                min_dim = min(width, height)
                left = (width - min_dim) // 2
                top = (height - min_dim) // 2
                right = left + min_dim
                bottom = top + min_dim
                img = img.crop((left, top, right, bottom))

                img = img.resize((512, 512), Image.LANCZOS)

                # Remove old image file if exists
                if user.avatar:
                    user.avatar.delete(save=False)

                # Save new image to user.avatar
                img_io = BytesIO()
                img.save(img_io, format='JPEG', quality=95)
                img_content = ContentFile(img_io.getvalue(), name='avatar.jpg')
                user.avatar.save('avatar.jpg', img_content, save=False)

            except Exception as e:
                messages.error(request, f"Failed to process profile picture: {str(e)}")
                return redirect('user_profile', user_id=user.id)

        # Banner (3:1)
        if 'banner_upload' in request.FILES:
            banner = request.FILES['banner_upload']
            try:
                img = Image.open(banner)
                img = img.convert('RGB')
                width, height = img.size
                target_ratio = 3 / 1

                actual_ratio = width / height
                if actual_ratio < target_ratio:
                    # Too tall: crop height
                    new_height = int(width / target_ratio)
                    top = (height - new_height) // 2
                    img = img.crop((0, top, width, top + new_height))
                elif actual_ratio > target_ratio:
                    # Too wide: crop width
                    new_width = int(height * target_ratio)
                    left = (width - new_width) // 2
                    img = img.crop((left, 0, left + new_width, height))

                img = img.resize((1500, 500), Image.LANCZOS)

                # Final check
                width, height = img.size
                if round(width / height, 2) != 3.00:
                    messages.error(request, "Banner must be 3:1 aspect ratio.")
                    return redirect('user_profile', user_id=user.id)

                # Remove old file if exists
                if user.banner:
                    user.banner.delete(save=False)

                # Assign image to field (without calling save yet)
                img_io = BytesIO()
                img.save(img_io, format='JPEG', quality=95)
                img_content = ContentFile(img_io.getvalue(), name='banner.jpg')
                user.banner = img_content  # assigned to be saved later

            except Exception as e:
                messages.error(request, f"Failed to process banner image: {str(e)}")
                return redirect('user_profile', user_id=user.id)

        # update bio
        if 'bio_upload' in request.POST and request.POST["bio_upload"] != "":
            user.bio = request.POST['bio_upload']

        user.save()
        if 'bio_upload' in request.POST or 'banner_upload' in request.FILES or 'pfp_upload' in request.FILES:
            messages.success(request, "Profile updated successfully.")
        return redirect('user_profile', user_id=user.id)
    

    return JsonResponse({"error": "Only POST allowed"}, status=405)

def user_profile(request, user_id):
    return render(request, 'users/profile.html', {"profile_id": user_id})



# too many security vulnerabilities with this... T-T
# not gonna allow non-logged users to play games or edit database ig
""" def create_guest(request):

    if request.COOKIES.get('guest_account'):
        return JsonResponse({"user_id": request.COOKIES.get('guest_account')}, status=200) 
    
    username = "Guest User "+uuid.uuid4().hex
    user_id = api.register_user(username,str(uuid.uuid4),"I am a guest user","🌐")["id"]
    response = JsonResponse({"user_id": user_id}, status=200) 
    response.set_cookie('guest_account', user_id, max_age=360000)
    return response """