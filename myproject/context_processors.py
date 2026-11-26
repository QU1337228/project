from .models import Profile


def profile(request):
    if request.user.is_authenticated:
        user_profile, _ = Profile.objects.get_or_create(user=request.user)
        return {'profile': user_profile}
    return {'profile': None}
