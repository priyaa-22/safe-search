from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from documents.models import Auditor
from accounts.constants import Roles

User = get_user_model()

class RBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Resolve or create default groups (created by signals automatically, but get_or_create to be safe)
        self.super_admin_group, _ = Group.objects.get_or_create(name=Roles.ADMINISTRATOR)
        self.internal_analyst_group, _ = Group.objects.get_or_create(name=Roles.INTERNAL_ANALYST)
        self.compliance_officer_group, _ = Group.objects.get_or_create(name=Roles.COMPLIANCE_OFFICER)
        self.external_auditor_group, _ = Group.objects.get_or_create(name=Roles.EXTERNAL_AUDITOR)
        self.read_only_analyst_group, _ = Group.objects.get_or_create(name=Roles.READ_ONLY_ANALYST)

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

    # 11. Health Check
    def test_health_check(self):
        url = "/api/health/"
        self.client.force_authenticate(user=None)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["status"], "healthy")
        self.assertEqual(response.data["data"]["database"], "up")


from documents.models import ExternalSearchAudit
from crypto_engine.peks import generate_rsa_keypair, generate_trapdoor_private

class AuditorActivityTimelineTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_group, _ = Group.objects.get_or_create(name=Roles.ADMINISTRATOR)
        self.compliance_group, _ = Group.objects.get_or_create(name=Roles.COMPLIANCE_OFFICER)
        self.analyst_group, _ = Group.objects.get_or_create(name=Roles.INTERNAL_ANALYST)
        self.external_auditor_group, _ = Group.objects.get_or_create(name=Roles.EXTERNAL_AUDITOR)

        self.super_admin = User.objects.create_user(username="super_admin_timeline", password="password123")
        self.super_admin.groups.add(self.admin_group)

        self.compliance = User.objects.create_user(username="compliance_timeline", password="password123")
        self.compliance.groups.add(self.compliance_group)

        self.analyst = User.objects.create_user(username="analyst_timeline", password="password123")
        self.analyst.groups.add(self.analyst_group)

    def test_auditor_creation_key_generation_and_download_logs(self):
        self.client.force_authenticate(user=self.super_admin)
        
        # 1. Auditor Creation
        url = "/api/auditor/create/"
        response = self.client.post(url, {"name": "Axis Bank"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        auditor_id = response.data["data"]["auditor_id"]
        
        # Verify database logs
        logs = ExternalSearchAudit.objects.filter(auditor_id=auditor_id).order_by("created_at")
        
        # We expect AUDITOR_CREATED, KEY_GENERATED, and CREDENTIAL_DOWNLOADED events
        event_types = [log.event_type for log in logs]
        self.assertIn("AUDITOR_CREATED", event_types)
        self.assertIn("KEY_GENERATED", event_types)
        self.assertIn("CREDENTIAL_DOWNLOADED", event_types)
        
        # Verify they are associated with the admin user who created it
        for log in logs:
            self.assertEqual(log.performed_by, self.super_admin)

    def test_key_rotation_and_download_logs(self):
        # Create an auditor first
        auditor = Auditor.objects.create(name="SBI", public_key="initial-key", key_version=1)
        
        self.client.force_authenticate(user=self.super_admin)
        url = "/api/auditor/rotate-key/"
        response = self.client.post(url, {"auditor_id": auditor.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify rotation, generation, and download logs
        logs = ExternalSearchAudit.objects.filter(auditor=auditor, event_type__in=["KEY_ROTATED", "KEY_GENERATED", "CREDENTIAL_DOWNLOADED"])
        self.assertEqual(logs.count(), 3)
        
        event_types = [log.event_type for log in logs]
        self.assertIn("KEY_ROTATED", event_types)
        self.assertIn("KEY_GENERATED", event_types)
        self.assertIn("CREDENTIAL_DOWNLOADED", event_types)

    def test_account_update_logs(self):
        auditor = Auditor.objects.create(name="SBI", public_key="initial-key", key_version=1)
        
        self.client.force_authenticate(user=self.super_admin)
        url = f"/api/auditor/{auditor.id}/update/"
        response = self.client.patch(url, {"name": "SBI Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify database log
        logs = ExternalSearchAudit.objects.filter(auditor=auditor, event_type="ACCOUNT_UPDATED")
        self.assertEqual(logs.count(), 1)
        self.assertEqual(logs.first().metadata["new_name"], "SBI Updated")

    def test_account_deletion_logs(self):
        auditor = Auditor.objects.create(name="SBI", public_key="initial-key", key_version=1)
        
        self.client.force_authenticate(user=self.super_admin)
        url = f"/api/auditor/{auditor.id}/delete/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify database log (since the auditor is deleted, the ForeignKey is SET_NULL)
        logs = ExternalSearchAudit.objects.filter(event_type="ACCOUNT_DELETED")
        self.assertEqual(logs.count(), 1)
        self.assertEqual(logs.first().metadata["name"], "SBI")

    def test_external_search_logs(self):
        private_key, public_key = generate_rsa_keypair()
        auditor = Auditor.objects.create(name="ICICI", public_key=public_key, key_version=1)
        
        keyword_hash, signature = generate_trapdoor_private("test-keyword", private_key)
        
        self.client.force_authenticate(user=self.super_admin)
        url = "/api/search/external/"
        response = self.client.post(url, {
            "auditor_id": auditor.id,
            "key_version": 1,
            "keyword_hash": keyword_hash,
            "signature": signature
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify log exists
        logs = ExternalSearchAudit.objects.filter(auditor=auditor, event_type="EXTERNAL_SEARCH")
        self.assertEqual(logs.count(), 1)
        self.assertTrue(logs.first().success)

    def test_timeline_api_ordering_and_permissions(self):
        # Create some events
        auditor = Auditor.objects.create(name="SBI", public_key="key", key_version=1)
        
        # Create logs manually with differing timestamps
        from django.utils import timezone
        
        log1 = ExternalSearchAudit.objects.create(
            auditor=auditor,
            event_type="AUDITOR_CREATED",
            success=True,
            created_at=timezone.now() - timezone.timedelta(seconds=10)
        )
        log2 = ExternalSearchAudit.objects.create(
            auditor=auditor,
            event_type="KEY_ROTATED",
            success=True,
            created_at=timezone.now()
        )
        
        url = "/api/auditor/timeline/"
        
        # 1. Super Admin (Allowed)
        self.client.force_authenticate(user=self.super_admin)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check ordering: log2 (newest) should be first, log1 should be second
        results = response.data["data"]["results"]
        self.assertEqual(results[0]["id"], log2.id)
        self.assertEqual(results[1]["id"], log1.id)
        
        # 2. Compliance Officer (Allowed)
        self.client.force_authenticate(user=self.compliance)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Internal Analyst (Forbidden)
        self.client.force_authenticate(user=self.analyst)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


