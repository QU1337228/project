import json

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST


def home(request):
    return render(request, 'index.html')


def _payload(request):
    try:
        return json.loads(request.body.decode('utf-8') or '{}')
    except (ValueError, UnicodeDecodeError):
        return {}


@require_POST
def login_view(request):
    data = _payload(request)
    identity = str(data.get('identity', data.get('email', ''))).strip()
    password = str(data.get('password', ''))

    if not identity or not password:
        return JsonResponse({'ok': False, 'error': 'Заполните логин/email и пароль'}, status=400)

    user = User.objects.filter(
        Q(username__iexact=identity) | Q(email__iexact=identity)
    ).order_by('id').first()
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
    auth_login(request, user)
    return JsonResponse({'ok': True, 'username': user.username})


@require_POST
def logout_view(request):
    auth_logout(request)
    return JsonResponse({'ok': True})
