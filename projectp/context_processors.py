from .models import Profile


def profile(request):
    cart = request.session.get('cart', [])
    context = {'profile': None, 'cart_count': len(cart)}
    if request.user.is_authenticated:
        user_profile, _ = Profile.objects.get_or_create(user=request.user)
        context['profile'] = user_profile
    return context
