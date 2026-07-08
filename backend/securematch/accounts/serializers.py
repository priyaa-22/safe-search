from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the Custom User model.
    Derives the 'role' dynamically from the user's groups.
    """
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "role",
            "first_name",
            "last_name",
            "email",
            "date_joined",
            "is_staff",
            "is_superuser",
        )

    def get_role(self, obj):
        """
        Retrieves the primary group name for the user to be used as 'role'.
        ASSUMPTION: If the user belongs to multiple groups (unexpected), we
        return the alphabetically first group name.
        """
        group = obj.groups.all().order_by("name").first()
        return group.name if group else "No Role Assigned"


class LoginSerializer(serializers.Serializer):
    """
    Serializer to validate incoming login credentials.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for updating the authenticated user's password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        user = self.context.get("request").user if self.context else None
        try:
            validate_password(value, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        user = self.context.get("request").user
        if not user:
            raise serializers.ValidationError("Authentication required.")
        
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError(
                {"old_password": "Old password is incorrect."}
            )

        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password cannot be the same as the old password."}
            )

        return attrs
