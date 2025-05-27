from django import forms
from users.models import Users
from django.contrib.auth.forms import UserCreationForm

class RegisterForm(UserCreationForm):
    country_code = forms.CharField(
        widget=forms.HiddenInput(attrs={
            'id': 'id_country_code',
            'class': 'form-input',
        }),
        required=False
    )

    class Meta:
        model = Users
        fields = ["username", "password1", "password2", "country_code"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].widget.attrs.update({
            'class': 'form-input',
            'placeholder': 'Username'
        })
        self.fields['password1'].widget.attrs.update({
            'class': 'form-input',
            'placeholder': 'Password'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-input',
            'placeholder': 'Repeat password'
        })