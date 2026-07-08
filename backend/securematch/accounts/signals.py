from django.db.models.signals import post_migrate
from django.contrib.auth.models import Group

def create_default_groups(sender, **kwargs):
    group_names = [
        "Super Administrator",
        "Internal Analyst",
        "Compliance Officer",
        "External Auditor",
        "Read Only Analyst",
    ]
    for name in group_names:
        Group.objects.get_or_create(name=name)
