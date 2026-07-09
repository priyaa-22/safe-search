export const mockStats = [
  {
    title: "Managed Identities",
    value: "24",
    trend: "+12%",
    trendType: "success",
    description: "from last month",
  },
  {
    title: "External Auditors",
    value: "6",
    trend: "+20%",
    trendType: "success",
    description: "certified entities",
  },
  {
    title: "Encrypted Documents",
    value: "3,482",
    trend: "+248 today",
    trendType: "success",
    description: "AES-256 protected",
  },
  {
    title: "Search Operations Today",
    value: "412",
    trend: "+18%",
    trendType: "success",
    description: "SSE & PEKS queries",
  },
  {
    title: "Security Events",
    value: "2",
    trend: "-50%",
    trendType: "success",
    description: "warnings last 24h",
  },
  {
    title: "System Health",
    value: "Healthy",
    trend: "100%",
    trendType: "success",
    description: "average uptime last 30d",
  },
];

export const mockRecentActivities = [
  {
    id: 1,
    action: "External Auditor Created",
    details: "Organization 'PwC Audit Team' registered successfully.",
    timestamp: "10 mins ago",
    type: "auditor_created",
  },
  {
    id: 2,
    action: "Identity Disabled",
    details: "Revoked access for user 'robert.c' due to policy review.",
    timestamp: "42 mins ago",
    type: "identity_disabled",
  },
  {
    id: 3,
    action: "Document Uploaded",
    details: "Encrypted index built for 'financial_report_q2.pdf'.",
    timestamp: "1 hour ago",
    type: "document_uploaded",
  },
  {
    id: 4,
    action: "Internal Search Executed",
    details: "SSE query performed on secure medical partition A.",
    timestamp: "3 hours ago",
    type: "search_executed",
  },
  {
    id: 5,
    action: "Auditor Key Rotated",
    details: "Version 3 PEKS keys generated for 'KPMG Auditor'.",
    timestamp: "5 hours ago",
    type: "key_rotated",
  },
  {
    id: 6,
    action: "Password Changed",
    details: "Security password updated for administrator account.",
    timestamp: "1 day ago",
    type: "password_changed",
  },
];

export const mockHealthChecks = [
  { name: "Database", status: "Healthy" },
  { name: "JWT Authentication", status: "Healthy" },
  { name: "Encryption Engine", status: "Healthy" },
  { name: "Search Engine", status: "Healthy" },
  { name: "API Status", status: "Healthy" },
];
