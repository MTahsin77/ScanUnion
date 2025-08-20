from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class PinAuthentication(BaseAuthentication):
    """
    Simple PIN-based authentication for scanner users.
    """
    def authenticate(self, request):
        pin = request.data.get('pin') if hasattr(request, 'data') else None
        
        if not pin:
            return None

        try:
            user = User.objects.get(pin=pin, enabled=True, role='USER')
            return (user, None)
        except User.DoesNotExist:
            return None

    def authenticate_header(self, request):
        return 'PIN'
