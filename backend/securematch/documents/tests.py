from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from documents.models import Auditor

User = get_user_model()

class RBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Resolve or create default groups (created by signals automatically, but get_or_create to be safe)
        self.super_admin_group, _ = Group.objects.get_or_create(name="Super Administrator")
        self.internal_analyst_group, _ = Group.objects.get_or_create(name="Internal Analyst")
        self.compliance_officer_group, _ = Group.objects.get_or_create(name="Compliance Officer")
        self.external_auditor_group, _ = Group.objects.get_or_create(name="External Auditor")
        self.read_only_analyst_group, _ = Group.objects.get_or_create(name="Read Only Analyst")

        # Create users for each role
        self.super_admin = User.objects.create_user(username="super_admin", password="password123")
        self.super_admin.groups.add(self.super_admin_group)

        self.internal_analyst = User.objects.create_user(username="internal_analyst", password="password123")
        self.internal_analyst.groups.add(self.internal_analyst_group)

        self.compliance_officer = User.objects.create_user(username="compliance_officer", password="password123")
        self.compliance_officer.groups.add(self.compliance_officer_group)

        self.external_auditor = User.objects.create_user(username="external_auditor", password="password123")
        self.external_auditor.groups.add(self.external_auditor_group)

        self.read_only_analyst = User.objects.create_user(username="read_only_analyst", password="password123")
        self.read_only_analyst.groups.add(self.read_only_analyst_group)

        # Create a test auditor for auditor-specific endpoints
        self.test_auditor = Auditor.objects.create(
            name="HDFC",
            public_key="test-public-key",
            key_version=1
        )

    def assert_allowed(self, user, method, url, data=None):
        self.client.force_authenticate(user=user)
        func = getattr(self.client, method)
        response = func(url, data=data)
        # If authorized, it should not return 403 Forbidden with PERMISSION_DENIED.
        # It could return 400 Bad Request or 404 Not Found (due to empty inputs or missing details),
        # but not a role permission restriction (403 with PERMISSION_DENIED).
        is_permission_denied = (
            response.status_code == status.HTTP_403_FORBIDDEN and 
            isinstance(response.data, dict) and 
            response.data.get("error", {}).get("code") == "PERMISSION_DENIED"
        )
        self.assertFalse(
            is_permission_denied,
            f"User {user.username} with role {user.groups.first().name} was forbidden on {method.upper()} {url} (expected allowed)"
        )

    def assert_forbidden(self, user, method, url, data=None):
        self.client.force_authenticate(user=user)
        func = getattr(self.client, method)
        response = func(url, data=data)
        self.assertEqual(
            response.status_code, 
            status.HTTP_403_FORBIDDEN, 
            f"User {user.username} with role {user.groups.first().name} was allowed on {method.upper()} {url} (expected forbidden)"
        )
        self.assertEqual(response.data["status"], "error")
        self.assertEqual(response.data["error"]["code"], "PERMISSION_DENIED")

    # 1. Upload Documents
    def test_upload_documents_permissions(self):
        url = "/api/upload/"
        self.assert_allowed(self.super_admin, "post", url)
        self.assert_allowed(self.internal_analyst, "post", url)
        
        self.assert_forbidden(self.compliance_officer, "post", url)
        self.assert_forbidden(self.external_auditor, "post", url)
        self.assert_forbidden(self.read_only_analyst, "post", url)

    # 2. Internal Search
    def test_internal_search_permissions(self):
        url = "/api/search/internal/"
        self.assert_allowed(self.super_admin, "post", url)
        self.assert_allowed(self.internal_analyst, "post", url)
        self.assert_allowed(self.compliance_officer, "post", url)
        self.assert_allowed(self.read_only_analyst, "post", url)
        
        self.assert_forbidden(self.external_auditor, "post", url)

    # 3. External Search
    def test_external_search_permissions(self):
        url = "/api/search/external/"
        self.assert_allowed(self.super_admin, "post", url)
        self.assert_allowed(self.external_auditor, "post", url)
        
        self.assert_forbidden(self.internal_analyst, "post", url)
        self.assert_forbidden(self.compliance_officer, "post", url)
        self.assert_forbidden(self.read_only_analyst, "post", url)

    # 4. Verify Auditor Credentials
    def test_verify_auditor_credentials_permissions(self):
        url = "/api/auditor/verify/"
        self.assert_allowed(self.super_admin, "post", url)
        self.assert_allowed(self.external_auditor, "post", url)
        
        self.assert_forbidden(self.internal_analyst, "post", url)
        self.assert_forbidden(self.compliance_officer, "post", url)
        self.assert_forbidden(self.read_only_analyst, "post", url)

    # 5. Rotate Auditor Keys
    def test_rotate_auditor_keys_permissions(self):
        url = "/api/auditor/rotate-key/"
        self.assert_allowed(self.super_admin, "post", url)
        
        self.assert_forbidden(self.internal_analyst, "post", url)
        self.assert_forbidden(self.compliance_officer, "post", url)
        self.assert_forbidden(self.external_auditor, "post", url)
        self.assert_forbidden(self.read_only_analyst, "post", url)

    # 6. Create Auditor
    def test_create_auditor_permissions(self):
        url = "/api/auditor/create/"
        self.assert_allowed(self.super_admin, "post", url)
        
        self.assert_forbidden(self.internal_analyst, "post", url)
        self.assert_forbidden(self.compliance_officer, "post", url)
        self.assert_forbidden(self.external_auditor, "post", url)
        self.assert_forbidden(self.read_only_analyst, "post", url)

    # 7. Delete Auditor
    def test_delete_auditor_permissions(self):
        url = f"/api/auditor/{self.test_auditor.id}/delete/"
        self.assert_allowed(self.super_admin, "delete", url)
        
        # Re-create auditor for subsequent tests
        self.test_auditor = Auditor.objects.create(
            name="HDFC",
            public_key="test-public-key",
            key_version=1
        )
        url = f"/api/auditor/{self.test_auditor.id}/delete/"
        self.assert_forbidden(self.internal_analyst, "delete", url)
        self.assert_forbidden(self.compliance_officer, "delete", url)
        self.assert_forbidden(self.external_auditor, "delete", url)
        self.assert_forbidden(self.read_only_analyst, "delete", url)

    # 8. View Auditor Logs
    def test_view_auditor_logs_permissions(self):
        url = f"/api/auditor/{self.test_auditor.id}/logs/"
        self.assert_allowed(self.super_admin, "get", url)
        self.assert_allowed(self.compliance_officer, "get", url)
        
        self.assert_forbidden(self.internal_analyst, "get", url)
        self.assert_forbidden(self.external_auditor, "get", url)
        self.assert_forbidden(self.read_only_analyst, "get", url)

    # 9. Internal Metrics
    def test_internal_metrics_permissions(self):
        url = "/api/metrics/internal/"
        self.assert_allowed(self.super_admin, "get", url)
        self.assert_allowed(self.compliance_officer, "get", url)
        
        self.assert_forbidden(self.internal_analyst, "get", url)
        self.assert_forbidden(self.external_auditor, "get", url)
        self.assert_forbidden(self.read_only_analyst, "get", url)

    # 10. External Metrics
    def test_external_metrics_permissions(self):
        url = "/api/metrics/external/"
        self.assert_allowed(self.super_admin, "get", url)
        self.assert_allowed(self.internal_analyst, "get", url)
        self.assert_allowed(self.compliance_officer, "get", url)
        self.assert_allowed(self.external_auditor, "get", url)
        self.assert_allowed(self.read_only_analyst, "get", url)
