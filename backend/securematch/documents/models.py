from django.db import models


# ---------------------------------------------------
# 🔐 Encrypted Document Storage
# ---------------------------------------------------

class EncryptedDocument(models.Model):
    encrypted_blob = models.JSONField()  # contains nonce + ciphertext
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"EncryptedDocument {self.id}"


# ---------------------------------------------------
# 🔎 Search Token Index (Dual Index: SSE + External)
# ---------------------------------------------------

class SearchTokenIndex(models.Model):
    # Internal SSE Token (HMAC-based)
    token = models.CharField(max_length=64, db_index=True)

    # External Public Hash (PEKS-inspired)
    external_token = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True
    )

    document = models.ForeignKey(
        EncryptedDocument,
        on_delete=models.CASCADE,
        related_name="tokens"
    )

    class Meta:
        indexes = [
            models.Index(fields=["token"]),
            models.Index(fields=["external_token"]),
        ]

    def __str__(self):
        return f"TokenIndex Doc {self.document_id}"


# ---------------------------------------------------
# 👤 Auditor (Public Key + Key Rotation Support)
# ---------------------------------------------------

class Auditor(models.Model):
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("DISABLED", "Disabled")
    )

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )
    public_key = models.TextField()

    # 🔁 Key Rotation Support
    key_version = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} (v{self.key_version})"


# ---------------------------------------------------
# 📜 External Search Audit Log
# ---------------------------------------------------

class ExternalSearchAudit(models.Model):
    auditor = models.ForeignKey(
        Auditor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="external_search_logs"
    )

    keyword_hash = models.CharField(max_length=64, db_index=True, null=True, blank=True)

    total_matches = models.IntegerField(default=0)
    returned_count = models.IntegerField(default=0)
    truncated = models.BooleanField(default=False)

    execution_time_ms = models.FloatField(null=True, blank=True)

    # 🔐 Security Tracking
    success = models.BooleanField(default=True)

    failure_reason = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # 🔑 Key Version Used During Search
    key_version = models.IntegerField(default=1)

    # 🌍 Request Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # 🛡️ Auditor Activity Logging Extensions
    event_type = models.CharField(
        max_length=50,
        default="EXTERNAL_SEARCH",
        choices=[
            ("AUDITOR_CREATED", "Auditor Created"),
            ("KEY_GENERATED", "Key Generated"),
            ("KEY_ROTATED", "Key Rotated"),
            ("ACCOUNT_UPDATED", "Account Updated"),
            ("ACCOUNT_DELETED", "Account Deleted"),
            ("CREDENTIAL_DOWNLOADED", "Credential Downloaded"),
            ("EXTERNAL_SEARCH", "External Search"),
        ],
        db_index=True
    )
    performed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="performed_audit_logs"
    )
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auditor"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["success"]),
            models.Index(fields=["keyword_hash"]),
            models.Index(fields=["event_type"]),
        ]

    def __str__(self):
        status = "SUCCESS" if self.success else "FAILED"
        auditor_id = self.auditor.id if self.auditor else "DELETED"
        return (
            f"[{status}] {self.event_type} - Auditor {auditor_id} "
            f"(v{self.key_version}) - {self.created_at}"
        )