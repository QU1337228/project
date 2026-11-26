import json

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from .models import Profile


def home(request):
    return render(request, 'index.html')


def profile_view(request):
    if not request.user.is_authenticated:
        return redirect('/')
    Profile.objects.get_or_create(user=request.user)
    return render(request, 'profile.html')


def _payload(request):
    try:
        return json.loads(request.body.decode('utf-8') or '{}')
    except (ValueError, UnicodeDecodeError):
        return {}


def _auth_error():
    return JsonResponse({'ok': False, 'error': 'Сначала войдите в аккаунт'}, status=401)


@require_POST
def login_view(request):
    data = _payload(request)
    identity = str(data.get('identity', data.get('email', ''))).strip()
    password = str(data.get('password', ''))

    if not identity or not password:
        return JsonResponse({'ok': False, 'error': 'Заполните логин/email и пароль'}, status=400)

    user = User.objects.filter(email__iexact=identity).order_by('id').first()
    if user is None:
        user = User.objects.filter(username__iexact=identity).order_by('id').first()
    if user is None:
        return JsonResponse({'ok': False, 'error': 'Пользователь не найден'}, status=400)

    user = authenticate(request, username=user.username, password=password)
    if user is None:
        return JsonResponse({'ok': False, 'error': 'Неверный пароль'}, status=400)

    auth_login(request, user)
    return JsonResponse({'ok': True, 'username': user.username})


@require_POST
def register_view(request):
    data = _payload(request)
    email = str(data.get('email', '')).strip()
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))
    confirm = str(data.get('confirm', ''))

    if not email or not username or not password:
        return JsonResponse({'ok': False, 'error': 'Заполните все поля'}, status=400)
    if password != confirm:
        return JsonResponse({'ok': False, 'error': 'Пароли не совпадают'}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'ok': False, 'error': 'Такой логин уже занят'}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({'ok': False, 'error': 'Такой email уже занят'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    Profile.objects.get_or_create(user=user)
    auth_login(request, user)
    return JsonResponse({'ok': True, 'username': user.username})


@require_POST
def logout_view(request):
    auth_logout(request)
    return JsonResponse({'ok': True})


@require_POST
def change_password_view(request):
    if not request.user.is_authenticated:
        return _auth_error()

    data = _payload(request)
    current = str(data.get('current', ''))
    password = str(data.get('password', ''))
    confirm = str(data.get('confirm', ''))

    if not current or not password or not confirm:
        return JsonResponse({'ok': False, 'error': 'Заполните все поля'}, status=400)
    if not request.user.check_password(current):
        return JsonResponse({'ok': False, 'error': 'Текущий пароль неверный'}, status=400)
    if password != confirm:
        return JsonResponse({'ok': False, 'error': 'Пароли не совпадают'}, status=400)

    request.user.set_password(password)
    request.user.save(update_fields=['password'])
    update_session_auth_hash(request, request.user)
    return JsonResponse({'ok': True})


@require_POST
def change_email_view(request):
    if not request.user.is_authenticated:
        return _auth_error()

    email = str(_payload(request).get('email', '')).strip()
    if not email:
        return JsonResponse({'ok': False, 'error': 'Укажите email'}, status=400)
    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'ok': False, 'error': 'Некорректный email'}, status=400)
    if User.objects.filter(email__iexact=email).exclude(pk=request.user.pk).exists():
        return JsonResponse({'ok': False, 'error': 'Такой email уже занят'}, status=400)

    request.user.email = email
    request.user.save(update_fields=['email'])
    return JsonResponse({'ok': True, 'email': request.user.email})


@require_POST
def change_username_view(request):
    if not request.user.is_authenticated:
        return _auth_error()

    username = str(_payload(request).get('username', '')).strip()
    if not username:
        return JsonResponse({'ok': False, 'error': 'Укажите логин'}, status=400)
    try:
        UnicodeUsernameValidator()(username)
    except ValidationError:
        return JsonResponse({'ok': False, 'error': 'Некорректный логин'}, status=400)
    if User.objects.filter(username__iexact=username).exclude(pk=request.user.pk).exists():
        return JsonResponse({'ok': False, 'error': 'Такой логин уже занят'}, status=400)

    request.user.username = username
    request.user.save(update_fields=['username'])
    return JsonResponse({'ok': True, 'username': request.user.username})


@require_POST
def change_avatar_view(request):
    if not request.user.is_authenticated:
        return _auth_error()

    avatar = request.FILES.get('avatar')
    if not avatar:
        return JsonResponse({'ok': False, 'error': 'Выберите файл'}, status=400)
    if not avatar.content_type.startswith('image/'):
        return JsonResponse({'ok': False, 'error': 'Нужен файл изображения'}, status=400)
    if avatar.size > 5 * 1024 * 1024:
        return JsonResponse({'ok': False, 'error': 'Файл слишком большой'}, status=400)

    user_profile, _ = Profile.objects.get_or_create(user=request.user)
    old_avatar = user_profile.avatar
    user_profile.avatar.save(avatar.name, avatar)
    if old_avatar and old_avatar.name != user_profile.avatar.name:
        old_avatar.delete(save=False)
    return JsonResponse({'ok': True, 'url': user_profile.avatar.url})
