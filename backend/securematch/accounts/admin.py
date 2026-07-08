from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User

    # Fields to display in list view
    list_display = (
        "username",
        "email",
        "get_role",
        "is_staff",
        "is_active",
        "last_login",
        "created_at",
    )

    # Filters on the right sidebar
    list_filter = (
        "groups",
        "is_staff",
        "is_active",
        "created_at",
    )

    # Search fields
    search_fields = (
        "username",
        "email",
    )

    # Readonly fields
    readonly_fields = (
        "created_at",
        "updated_at",
        "last_login",
    )

    # Fieldsets for detail view editing
    fieldsets = UserAdmin.fieldsets + (
        (
            "Custom Fields",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    def get_role(self, obj):
        # Return the primary group name (alphabetically first if multiple)
        group = obj.groups.all().order_by("name").first()
        return group.name if group else "-"
    get_role.short_description = "Role"

admin.site.register(User, CustomUserAdmin)
