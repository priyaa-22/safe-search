from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.constants import Roles
from accounts.utils import (
    get_primary_role,
    is_administrator,
    is_internal_user,
    is_external_auditor,
)

User = get_user_model()


class AccountsRBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Verify groups are created (signals should run, but ensure they exist)
        self.admin_group, _ = Group.objects.get_or_create(name=Roles.ADMINISTRATOR)
        self.internal_analyst_group, _ = Group.objects.get_or_create(name=Roles.INTERNAL_ANALYST)
        self.compliance_officer_group, _ = Group.objects.get_or_create(name=Roles.COMPLIANCE_OFFICER)
        self.external_auditor_group, _ = Group.objects.get_or_create(name=Roles.EXTERNAL_AUDITOR)
        self.read_only_analyst_group, _ = Group.objects.get_or_create(name=Roles.READ_ONLY_ANALYST)

    def test_superuser_resolves_to_administrator(self):
        superuser = User.objects.create_superuser(username="superuser", password="password123", email="super@example.com")
        self.assertEqual(get_primary_role(superuser), Roles.ADMINISTRATOR)
        self.assertTrue(is_administrator(superuser))

    def test_user_resolves_to_group_roles(self):
        analyst = User.objects.create_user(username="analyst", password="password123")
        analyst.groups.add(self.internal_analyst_group)
        self.assertEqual(get_primary_role(analyst), Roles.INTERNAL_ANALYST)
        self.assertTrue(is_internal_user(analyst))
        self.assertFalse(is_administrator(analyst))

        auditor = User.objects.create_user(username="auditor", password="password123")
        auditor.groups.add(self.external_auditor_group)
        self.assertEqual(get_primary_role(auditor), Roles.EXTERNAL_AUDITOR)
        self.assertTrue(is_external_auditor(auditor))
        self.assertFalse(is_internal_user(auditor))

        compliance = User.objects.create_user(username="compliance", password="password123")
        compliance.groups.add(self.compliance_officer_group)
        self.assertEqual(get_primary_role(compliance), Roles.COMPLIANCE_OFFICER)
        self.assertTrue(is_internal_user(compliance))

        read_only = User.objects.create_user(username="readonly", password="password123")
        read_only.groups.add(self.read_only_analyst_group)
        self.assertEqual(get_primary_role(read_only), Roles.READ_ONLY_ANALYST)
        self.assertTrue(is_internal_user(read_only))

    def test_login_returns_administrator_for_superuser(self):
        User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        response = self.client.post("/api/auth/login/", {"username": "admin_user", "password": "password123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user_data = response.data["data"]["user"]
        self.assertEqual(user_data["role"], Roles.ADMINISTRATOR)

    def test_me_returns_administrator_for_superuser(self):
        superuser = User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        self.client.force_authenticate(user=superuser)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["role"], Roles.ADMINISTRATOR)

    def test_internal_identity_directory_lists_only_active_internal_users(self):
        analyst = User.objects.create_user(
            username="analyst_user",
            password="password123",
            first_name="Asha",
            last_name="Patel",
        )
        analyst.groups.add(self.internal_analyst_group)

        compliance = User.objects.create_user(
            username="compliance_user",
            password="password123",
            first_name="Mira",
            last_name="Rao",
        )
        compliance.groups.add(self.compliance_officer_group)

        disabled_user = User.objects.create_user(
            username="disabled_user",
            password="password123",
            first_name="Disabled",
            is_active=False,
        )
        disabled_user.groups.add(self.read_only_analyst_group)

        auditor = User.objects.create_user(username="auditor_user", password="password123")
        auditor.groups.add(self.external_auditor_group)

        admin = User.objects.create_superuser(username="admin_hidden", password="password123", email="admin_hidden@example.com")

        response = self.client.get("/api/auth/internal-identities/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["data"],
            [
                {
                    "id": analyst.id,
                    "username": "analyst_user",
                    "fullName": "Asha Patel",
                    "role": Roles.INTERNAL_ANALYST,
                },
                {
                    "id": compliance.id,
                    "username": "compliance_user",
                    "fullName": "Mira Rao",
                    "role": Roles.COMPLIANCE_OFFICER,
                },
            ],
        )

        self.assertNotIn(admin.id, [entry["id"] for entry in response.data["data"]])
        self.assertNotIn(auditor.id, [entry["id"] for entry in response.data["data"]])
        self.assertNotIn(disabled_user.id, [entry["id"] for entry in response.data["data"]])

    def test_list_users_as_administrator_allowed(self):
        superuser = User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        self.client.force_authenticate(user=superuser)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 1)

    def test_list_users_as_analyst_denied(self):
        analyst = User.objects.create_user(username="analyst_user", password="password123")
        analyst.groups.add(self.internal_analyst_group)
        self.client.force_authenticate(user=analyst)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_user_allowed(self):
        superuser = User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        self.client.force_authenticate(user=superuser)
        data = {
            "username": "new_compliance",
            "fullName": "Sarah Jenkins",
            "email": "sarah@securematch.io",
            "password": "password123",
            "role": Roles.COMPLIANCE_OFFICER,
        }
        response = self.client.post("/api/users/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["username"], "new_compliance")
        self.assertEqual(response.data["data"]["role"], Roles.COMPLIANCE_OFFICER)

        # Verify database
        new_user = User.objects.get(username="new_compliance")
        self.assertEqual(get_primary_role(new_user), Roles.COMPLIANCE_OFFICER)

    def test_create_user_administrator_denied(self):
        superuser = User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        self.client.force_authenticate(user=superuser)
        data = {
            "username": "fake_admin",
            "fullName": "Fake Admin",
            "email": "fake@securematch.io",
            "password": "password123",
            "role": Roles.ADMINISTRATOR,
        }
        response = self.client.post("/api/users/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_user_allowed(self):
        superuser = User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        analyst = User.objects.create_user(username="analyst_edit", password="password123")
        analyst.groups.add(self.internal_analyst_group)

        self.client.force_authenticate(user=superuser)
        data = {
            "fullName": "Updated Name",
            "email": "updated@securematch.io",
            "role": Roles.COMPLIANCE_OFFICER,
            "status": "Disabled"
        }
        response = self.client.patch(f"/api/users/{analyst.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["fullName"], "Updated Name")
        self.assertEqual(response.data["data"]["email"], "updated@securematch.io")
        self.assertEqual(response.data["data"]["role"], Roles.COMPLIANCE_OFFICER)
        self.assertEqual(response.data["data"]["status"], "Disabled")

        # Verify database
        analyst.refresh_from_db()
        self.assertEqual(analyst.first_name, "Updated")
        self.assertEqual(analyst.last_name, "Name")
        self.assertFalse(analyst.is_active)
        self.assertEqual(get_primary_role(analyst), Roles.COMPLIANCE_OFFICER)

    def test_delete_user_allowed(self):
        superuser = User.objects.create_superuser(username="admin_user", password="password123", email="admin@example.com")
        analyst = User.objects.create_user(username="analyst_delete", password="password123")
        analyst.groups.add(self.internal_analyst_group)

        self.client.force_authenticate(user=superuser)
        response = self.client.delete(f"/api/users/{analyst.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(id=analyst.id).exists())
