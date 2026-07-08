from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from documents.utils import success_response, error_response
from .serializers import UserSerializer, LoginSerializer, ChangePasswordSerializer

class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates a user with username and password.
    Returns Access Token, Refresh Token, and User Information.
    """
    permission_classes = ()
    authentication_classes = ()
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Invalid request data.",
                    details=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=username, password=password)

        if user is None:
            # Login Error Messages: Do NOT reveal whether username exists or password is incorrect.
            return Response(
                error_response(
                    code="INVALID_CREDENTIALS",
                    message="Invalid username or password.",
                ),
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                error_response(
                    code="USER_DISABLED",
                    message="User account is disabled.",
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate simplejwt tokens
        refresh = RefreshToken.for_user(user)
        
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
        return Response(success_response(data=data), status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the provided refresh token. Requires IsAuthenticated.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                error_response(
                    code="MISSING_FIELD",
                    message="Refresh token is required.",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            return Response(
                error_response(
                    code="INVALID_TOKEN",
                    message=str(e),
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            success_response(data={"message": "Successfully logged out."}),
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Returns authenticated user information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(success_response(data=serializer.data), status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Updates the authenticated user's password after validating details.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Password change validation failed.",
                    details=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        # Update the session hash to keep user logged in if they have a session
        update_session_auth_hash(request, user)

        return Response(
            success_response(data={"message": "Password has been changed successfully."}),
            status=status.HTTP_200_OK,
        )
