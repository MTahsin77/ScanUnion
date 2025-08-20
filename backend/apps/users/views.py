from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer, ChangePasswordSerializer
from .permissions import IsAdminUser

User = get_user_model()


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'enabled']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint for both scanner users (PIN) and admin users (email/password).
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # For admin users, generate JWT tokens
    if user.role == 'ADMIN':
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'is_first_login': user.is_first_login
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    
    # For scanner users, also generate JWT tokens for API access
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': {
            'id': user.id,
            'name': user.name,
            'role': user.role,
            'is_first_login': user.is_first_login
        },
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change password endpoint for admin users.
    """
    if request.user.role != 'ADMIN':
        return Response(
            {'error': 'Only admin users can change password'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = request.user
    new_password = serializer.validated_data['new_password']
    
    user.set_password(new_password)
    user.temp_password = None
    user.is_first_login = False
    user.save()
    
    return Response({'message': 'Password changed successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Get current user profile.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
