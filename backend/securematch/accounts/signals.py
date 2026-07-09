from django.contrib.auth.models import Group
from accounts.constants import Roles


def create_default_groups(sender, **kwargs):
    """
    Automatically creates Django groups for roles in Roles.all() after database migrations.
    """
    for name in Roles.all():
        Group.objects.get_or_create(name=name)
