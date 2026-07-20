from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APIClient
from rest_framework import status

from accounts.constants import Roles
from documents.models import SystemAuditLog

User = get_user_model()


class ComplianceOfficerTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_superuser(
            username="admin_test",
            email="admin@test.com",
            password="Password123!"
        )
        admin_group, _ = Group.objects.get_or_create(name=Roles.ADMINISTRATOR)
        self.admin_user.groups.add(admin_group)

        # Compliance Officer user
        self.compliance_user = User.objects.create_user(
            username="officer_test",
            email="officer@test.com",
            password="Password123!"
        )
        compliance_group, _ = Group.objects.get_or_create(name=Roles.COMPLIANCE_OFFICER)
        self.compliance_user.groups.add(compliance_group)

        # Internal Analyst user
        self.analyst_user = User.objects.create_user(
            username="analyst_test",
            email="analyst@test.com",
            password="Password123!"
        )
        analyst_group, _ = Group.objects.get_or_create(name=Roles.INTERNAL_ANALYST)
        self.analyst_user.groups.add(analyst_group)

    def test_admin_can_create_compliance_officer(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post("/api/users/", {
            "username": "new_compliance_officer",
            "fullName": "Jane Compliance",
            "email": "jane@compliance.io",
            "password": "SecurePassword123!",
            "role": Roles.COMPLIANCE_OFFICER,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["role"], Roles.COMPLIANCE_OFFICER)

    def test_non_admin_cannot_create_compliance_officer(self):
        self.client.force_authenticate(user=self.compliance_user)
        response = self.client.post("/api/users/", {
            "username": "unauthorized_create",
            "fullName": "Attempt User",
            "password": "Password123!",
            "role": Roles.COMPLIANCE_OFFICER,
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_compliance_dashboard_access(self):
        # Unauthenticated -> 401
        response = self.client.get("/api/compliance/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Analyst -> 403
        self.client.force_authenticate(user=self.analyst_user)
        response = self.client.get("/api/compliance/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Compliance Officer -> 200
        self.client.force_authenticate(user=self.compliance_user)
        response = self.client.get("/api/compliance/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("audit_overview", response.data["data"])
        self.assertIn("metrics", response.data["data"])

    def test_compliance_audit_logs_filtering(self):
        self.client.force_authenticate(user=self.compliance_user)
        response = self.client.get("/api/compliance/audit-logs/?severity=CRITICAL&page=1&page_size=10")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data["data"])
        self.assertIn("meta", response.data)

    def test_compliance_metrics_chart_data(self):
        self.client.force_authenticate(user=self.compliance_user)
        response = self.client.get("/api/compliance/metrics/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertIn("audit_activity_timeline", data)
        self.assertIn("internal_vs_external_searches", data)
        self.assertIn("verification_outcomes", data)
        self.assertIn("auditor_activity_trend", data)
        self.assertIn("security_events_by_severity", data)
        self.assertIn("audit_event_distribution", data)
        self.assertIn("system_health_overview", data)
        self.assertIn("top_active_organizations", data)
        self.assertIn("search_performance", data)
        self.assertIn("compliance_trend", data)

    def test_compliance_export_logs(self):
        self.client.force_authenticate(user=self.compliance_user)
        
        # CSV Export
        csv_resp = self.client.get("/api/compliance/export-logs/?format=csv")
        self.assertEqual(csv_resp.status_code, status.HTTP_200_OK)
        self.assertIn("text/csv", csv_resp["Content-Type"])

        # Excel Export
        xlsx_resp = self.client.get("/api/compliance/export-logs/?format=xlsx")
        self.assertEqual(xlsx_resp.status_code, status.HTTP_200_OK)
        self.assertIn("openxmlformats", xlsx_resp["Content-Type"])

        # PDF Export
        pdf_resp = self.client.get("/api/compliance/export-logs/?format=pdf")
        self.assertEqual(pdf_resp.status_code, status.HTTP_200_OK)
        self.assertEqual("application/pdf", pdf_resp["Content-Type"])

    def test_compliance_officer_cannot_execute_internal_search(self):
        self.client.force_authenticate(user=self.compliance_user)
        response = self.client.post("/api/search/internal/", {"first_name": "John"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_compliance_requests_are_logged(self):
        self.client.force_authenticate(user=self.compliance_user)
        initial_log_count = SystemAuditLog.objects.count()
        self.client.get("/api/compliance/dashboard/")
        new_log_count = SystemAuditLog.objects.count()
        self.assertGreater(new_log_count, initial_log_count)
