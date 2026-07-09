class Roles:
    """
    Centralized container for application role constants and query utilities.
    """
    ADMINISTRATOR = "Administrator"
    INTERNAL_ANALYST = "Internal Analyst"
    COMPLIANCE_OFFICER = "Compliance Officer"
    EXTERNAL_AUDITOR = "External Auditor"
    READ_ONLY_ANALYST = "Read Only Analyst"
    NO_ROLE = "No Role Assigned"

    CHOICES = (
        ADMINISTRATOR,
        INTERNAL_ANALYST,
        COMPLIANCE_OFFICER,
        EXTERNAL_AUDITOR,
        READ_ONLY_ANALYST,
    )

    @classmethod
    def all(cls) -> list[str]:
        """
        Returns a list of all defined application roles.
        """
        return [
            cls.ADMINISTRATOR,
            cls.INTERNAL_ANALYST,
            cls.COMPLIANCE_OFFICER,
            cls.EXTERNAL_AUDITOR,
            cls.READ_ONLY_ANALYST,
        ]

    @classmethod
    def internal_roles(cls) -> list[str]:
        """
        Returns a list of roles that belong to internal operators.
        """
        return [
            cls.INTERNAL_ANALYST,
            cls.COMPLIANCE_OFFICER,
            cls.READ_ONLY_ANALYST,
        ]

    @classmethod
    def auditor_roles(cls) -> list[str]:
        """
        Returns a list of roles corresponding to external auditors.
        """
        return [
            cls.EXTERNAL_AUDITOR,
        ]

    @classmethod
    def administrative_roles(cls) -> list[str]:
        """
        Returns a list of roles that possess administrative access.
        """
        return [
            cls.ADMINISTRATOR,
        ]
