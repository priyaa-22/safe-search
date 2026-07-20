from django.contrib.auth import authenticate, update_session_auth_hash, get_user_model
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from documents.utils import success_response, error_response
from accounts.utils import is_administrator, get_primary_role
from accounts.constants import Roles
from .serializers import UserSerializer, LoginSerializer, ChangePasswordSerializer

User = get_user_model()


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


class InternalIdentityDirectoryView(APIView):
    """
    GET /api/auth/internal-identities/
    Returns a public directory of active internal identities for portal selection.
    """
    permission_classes = ()
    authentication_classes = ()
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def get(self, request, *args, **kwargs):
        users = (
            User.objects.filter(is_active=True, groups__name__in=Roles.internal_roles())
            .distinct()
            .order_by("first_name", "last_name", "username")
        )

        data = []
        for user in users:
            data.append({
                "id": user.id,
                "username": user.username,
                "fullName": f"{user.first_name} {user.last_name}".strip() or user.username,
                "role": get_primary_role(user),
            })

        return Response(success_response(data=data), status=status.HTTP_200_OK)


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


class UserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if not is_administrator(request.user):
            self.permission_denied(
                request,
                message="Access denied: Insufficient privileges.",
                code="PERMISSION_DENIED"
            )

    def get(self, request, *args, **kwargs):
        """
        GET /api/users/
        Returns list of all users.
        """
        users = User.objects.all().order_by("-created_at")
        
        # Serialize users
        data = []
        for user in users:
            role = get_primary_role(user)
            # Standardizing lastLogin format for frontend
            last_login_str = "Never"
            if user.last_login:
                last_login_str = user.last_login.strftime("%Y-%m-%d %H:%M")
                
            data.append({
                "id": user.id,
                "username": user.username,
                "fullName": f"{user.first_name} {user.last_name}".strip() or user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email or "",
                "role": role,
                "status": "Active" if user.is_active else "Disabled",
                "lastLogin": last_login_str,
                "created": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
            })
            
        return Response(success_response(data=data), status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """
        POST /api/users/
        Creates a new user.
        """
        # Validate fields
        username = request.data.get("username")
        fullName = request.data.get("fullName", "")
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role")

        if not username or not password or not role:
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Username, password, and role are required.",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Username already exists.",
                    details={"username": ["A user with that username already exists."]}
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Block Administrator from being created via this endpoint
        if role == Roles.ADMINISTRATOR:
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Cannot create an Administrator user.",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create user
        name_parts = fullName.strip().split(" ", 1)
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )

        # Set role/group
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        # Return serialized user
        data = {
            "id": user.id,
            "username": user.username,
            "fullName": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email or "",
            "role": role,
            "status": "Active" if user.is_active else "Disabled",
            "lastLogin": "Never",
            "created": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
        }
        return Response(success_response(data=data), status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if not is_administrator(request.user):
            self.permission_denied(
                request,
                message="Access denied: Insufficient privileges.",
                code="PERMISSION_DENIED"
            )

    def get(self, request, pk, *args, **kwargs):
        """
        GET /api/users/{id}/
        Returns details of a user.
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                error_response(
                    code="NOT_FOUND",
                    message="User not found.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        role = get_primary_role(user)
        last_login_str = "Never"
        if user.last_login:
            last_login_str = user.last_login.strftime("%Y-%m-%d %H:%M")

        data = {
            "id": user.id,
            "username": user.username,
            "fullName": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email or "",
            "role": role,
            "status": "Active" if user.is_active else "Disabled",
            "lastLogin": last_login_str,
            "created": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
        }
        return Response(success_response(data=data), status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        """
        PATCH /api/users/{id}/
        Updates a user.
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                error_response(
                    code="NOT_FOUND",
                    message="User not found.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate updating Administrator users or setting someone to Administrator
        role = request.data.get("role")
        current_role = get_primary_role(user)

        # Block editing/modifying Administrator from IAM
        if current_role == Roles.ADMINISTRATOR or role == Roles.ADMINISTRATOR:
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Administrator users cannot be modified via the IAM portal.",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update fields
        fullName = request.data.get("fullName")
        if fullName is not None:
            name_parts = fullName.strip().split(" ", 1)
            user.first_name = name_parts[0] if len(name_parts) > 0 else ""
            user.last_name = name_parts[1] if len(name_parts) > 1 else ""

        email = request.data.get("email")
        if email is not None:
            user.email = email

        status_val = request.data.get("status")
        if status_val is not None:
            user.is_active = (status_val == "Active")

        # Update role/group
        if role is not None:
            user.groups.clear()
            group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(group)

        # Update password if provided
        password = request.data.get("password")
        if password:
            user.set_password(password)

        user.save()

        # Log event if the updated user is an external auditor
        if get_primary_role(user) == Roles.EXTERNAL_AUDITOR:
            try:
                from documents.utils import log_auditor_event, get_client_ip
                from documents.models import Auditor
                fullName = f"{user.first_name} {user.last_name}".strip()
                auditor = Auditor.objects.filter(name__icontains=fullName or user.username).first()
                log_auditor_event(
                    auditor=auditor,
                    event_type="ACCOUNT_UPDATED",
                    performed_by=request.user,
                    ip_address=get_client_ip(request),
                    success=True,
                    metadata={"username": user.username, "updated_fields": {k: v for k, v in request.data.items() if k != "password"}}
                )
            except Exception:
                pass

        # Invalidate cache
        if hasattr(user, "_cached_primary_role"):
            delattr(user, "_cached_primary_role")

        last_login_str = "Never"
        if user.last_login:
            last_login_str = user.last_login.strftime("%Y-%m-%d %H:%M")

        data = {
            "id": user.id,
            "username": user.username,
            "fullName": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email or "",
            "role": get_primary_role(user),
            "status": "Active" if user.is_active else "Disabled",
            "lastLogin": last_login_str,
            "created": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
        }
        return Response(success_response(data=data), status=status.HTTP_200_OK)

    def delete(self, request, pk, *args, **kwargs):
        """
        DELETE /api/users/{id}/
        Deletes a user.
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                error_response(
                    code="NOT_FOUND",
                    message="User not found.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        # Block deleting Administrator users
        current_role = get_primary_role(user)
        if current_role == Roles.ADMINISTRATOR:
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="Administrator users cannot be deleted.",
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Log event if the deleted user is an external auditor
        if current_role == Roles.EXTERNAL_AUDITOR:
            try:
                from documents.utils import log_auditor_event, get_client_ip
                from documents.models import Auditor
                fullName = f"{user.first_name} {user.last_name}".strip()
                auditor = Auditor.objects.filter(name__icontains=fullName or user.username).first()
                log_auditor_event(
                    auditor=auditor,
                    event_type="ACCOUNT_DELETED",
                    performed_by=request.user,
                    ip_address=get_client_ip(request),
                    success=True,
                    metadata={"username": user.username}
                )
            except Exception:
                pass

        user.delete()
        return Response(
            success_response(data={"message": "User deleted successfully."}),
            status=status.HTTP_200_OK
        )
