from rest_framework import serializers
from django.core.validators import RegexValidator
from documents.models import Auditor


class AuditorRetrieveSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving Auditor Profile details.
    """

    class Meta:
        model = Auditor
        fields = (
            "id",
            "name",
            "organization_name",
            "organization_code",
            "username",
            "email",
            "phone",
            "designation",
            "public_key",
            "key_version",
            "status",
            "last_rotation",
            "created_at",
            "updated_at",
        )


class AuditorCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Auditor profiles.
    """

    name = serializers.CharField(
        min_length=3,
        max_length=255,
        required=True,
        allow_blank=False,
    )
    email = serializers.EmailField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    organization_code = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
    )
    organization_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    phone = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    designation = serializers.CharField(
        max_length=255,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    status = serializers.ChoiceField(
        choices=Auditor.STATUS_CHOICES,
        required=False,
        default="ACTIVE",
    )

    class Meta:
        model = Auditor
        fields = (
            "name",
            "organization_name",
            "organization_code",
            "email",
            "phone",
            "designation",
            "status",
        )

    def validate_name(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Name cannot be empty.")
        if Auditor.objects.filter(name__iexact=normalized).exists():
            raise serializers.ValidationError("An auditor with this name already exists.")
        return normalized

    def validate_email(self, value):
        if value is None:
            return None

        normalized = value.strip()
        if not normalized:
            return None

        if Auditor.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("An auditor with this email already exists.")
        return normalized

    def validate_organization_code(self, value):
        normalized = value.strip().upper()
        return normalized

    def validate_organization_name(self, value):
        return value.strip()

    def validate_phone(self, value):
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None

    def validate_designation(self, value):
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None


class AuditorUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating Auditor Profile.
    """

    name = serializers.CharField(
        min_length=3,
        max_length=255,
        required=False,
        allow_blank=False,
    )
    email = serializers.EmailField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    organization_code = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=False,
    )
    organization_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=False,
    )
    phone = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    designation = serializers.CharField(
        max_length=255,
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    class Meta:
        model = Auditor
        fields = (
            "name",
            "organization_name",
            "organization_code",
            "email",
            "phone",
            "designation",
        )

    def validate(self, attrs):
        editable_fields = set(self.Meta.fields)
        submitted_editable_fields = editable_fields.intersection(self.initial_data.keys())

        if "name" in self.initial_data and not str(self.initial_data["name"]).strip():
            raise serializers.ValidationError({"name": "Name cannot be empty."})

        if not submitted_editable_fields:
            raise serializers.ValidationError(
                "At least one editable auditor profile field is required."
            )
        return attrs

    def validate_email(self, value):
        if value:
            instance = self.instance
            queryset = Auditor.objects.filter(email__iexact=value)
            if instance:
                queryset = queryset.exclude(id=instance.id)
            if queryset.exists():
                raise serializers.ValidationError("An auditor with this email already exists.")
        return value

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")

        instance = self.instance
        queryset = Auditor.objects.filter(name__iexact=value.strip())
        if instance:
            queryset = queryset.exclude(id=instance.id)
        if queryset.exists():
            raise serializers.ValidationError("An auditor with this name already exists.")
        return value.strip()

    def validate_organization_code(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Organization code cannot be empty.")

        normalized = value.strip().upper()
        instance = self.instance
        queryset = Auditor.objects.filter(organization_code__iexact=normalized)
        if instance:
            queryset = queryset.exclude(id=instance.id)
        if queryset.exists():
            raise serializers.ValidationError("An auditor with this organization code already exists.")
        return normalized

    def validate_organization_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Organization name cannot be empty.")
        return value.strip()


class AuditorStatusSerializer(serializers.Serializer):
    """
    Serializer for updating Auditor status.
    """

    status = serializers.ChoiceField(
        choices=Auditor.STATUS_CHOICES,
        required=True,
        error_messages={
            "invalid_choice": "Invalid status values. Supported values are ACTIVE and DISABLED."
        }
    )
