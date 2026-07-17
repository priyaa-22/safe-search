# Project File Structure

This document provides a comprehensive overview of the `safe-search` project file structure.

---

## Directory Tree

```text
safe-search/
├── backend/
│   ├── docs/
│   │   └── API_DOCUMENTATION.md
│   ├── securematch/
│   │   ├── accounts/
│   │   │   ├── api/
│   │   │   ├── migrations/
│   │   │   │   ├── 0001_initial.py
│   │   │   │   ├── 0002_remove_user_is_verified_remove_user_role.py
│   │   │   │   └── __init__.py
│   │   │   ├── serializers/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── exception_handler.py
│   │   │   ├── models.py
│   │   │   ├── permissions.py
│   │   │   ├── serializers.py
│   │   │   ├── signals.py
│   │   │   ├── tests.py
│   │   │   ├── urls.py
│   │   │   ├── utils.py
│   │   │   └── views.py
│   │   ├── crypto_engine/
│   │   │   ├── migrations/
│   │   │   │   └── __init__.py
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── key_manager.py
│   │   │   ├── models.py
│   │   │   ├── peks.py
│   │   │   ├── sse.py
│   │   │   ├── tests.py
│   │   │   └── views.py
│   │   ├── documents/
│   │   │   ├── migrations/
│   │   │   │   ├── 0001_initial.py
│   │   │   │   ├── 0002_auditor.py
│   │   │   │   ├── 0003_searchtokenindex_external_token.py
│   │   │   │   ├── 0004_externalsearchaudit.py
│   │   │   │   ├── 0005_alter_externalsearchaudit_options_and_more.py
│   │   │   │   ├── 0006_alter_auditor_options_and_more.py
│   │   │   │   ├── 0007_auditor_designation_auditor_email_auditor_phone_and_more.py
│   │   │   │   └── __init__.py
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auditor_service.py
│   │   │   │   ├── credential_service.py
│   │   │   │   ├── key_service.py
│   │   │   │   └── log_export_service.py
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── constants.py
│   │   │   ├── models.py
│   │   │   ├── pdf_generator.py
│   │   │   ├── serializers.py
│   │   │   ├── tests.py
│   │   │   ├── urls.py
│   │   │   ├── utils.py
│   │   │   └── views.py
│   │   ├── securematch/
│   │   │   ├── __init__.py
│   │   │   ├── asgi.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   ├── .gitignore
│   │   └── manage.py
│   ├── .dockerignore
│   ├── .env
│   ├── CURRENT_STATUS.md
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── TopNavbar.jsx
│   │   │   ├── iam/
│   │   │   │   ├── DeleteIdentityDialog.jsx
│   │   │   │   ├── DisableIdentityDialog.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── IdentityFilters.jsx
│   │   │   │   ├── IdentityModal.jsx
│   │   │   │   ├── IdentityRow.jsx
│   │   │   │   ├── IdentitySearch.jsx
│   │   │   │   ├── IdentityTable.jsx
│   │   │   │   └── LoadingSkeleton.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Badge/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Button/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Card/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Divider/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── EmptyState/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Input/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── LoadingSkeleton/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Modal/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── PageHeader/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Section/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── StatusBadge/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Table/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Terminal/
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Toolbar/
│   │   │   │   │   └── index.jsx
│   │   │   │   └── index.js
│   │   │   ├── CreateAuditorCard.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── MetricsPage.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── StoragePage.jsx
│   │   │   ├── Terminal.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── UploadPage.jsx
│   │   ├── config/
│   │   │   └── permissions.js
│   │   ├── constants/
│   │   │   ├── features.js
│   │   │   ├── roles.js
│   │   │   ├── routes.js
│   │   │   └── status.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuditors.js
│   │   │   ├── useDashboard.js
│   │   │   ├── useIdentity.js
│   │   │   └── usePermissions.js
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx
│   │   ├── mock/
│   │   │   ├── analytics.js
│   │   │   ├── auditors.js
│   │   │   ├── dashboard.js
│   │   │   ├── documents.js
│   │   │   ├── identities.js
│   │   │   └── search.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Auditors.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Documents.jsx
│   │   │   │   ├── IAM.jsx
│   │   │   │   ├── Metrics.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── Search.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Users.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── routes/
│   │   │   ├── PermissionRoute.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── services/
│   │   │   ├── analytics.js
│   │   │   ├── api.js
│   │   │   ├── auditor.js
│   │   │   ├── auditorService.js
│   │   │   ├── auth.js
│   │   │   ├── documents.js
│   │   │   ├── externalSearchService.js
│   │   │   ├── identity.js
│   │   │   ├── internalSearchService.js
│   │   │   ├── search.js
│   │   │   ├── settings.js
│   │   │   └── uploadService.js
│   │   ├── types/
│   │   │   ├── analytics.js
│   │   │   ├── auditor.js
│   │   │   ├── documents.js
│   │   │   ├── identity.js
│   │   │   └── search.js
│   │   ├── utils/
│   │   │   ├── crypto.js
│   │   │   ├── errorHandler.js
│   │   │   └── errors.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
├── authentication.md
├── filestructure.md
├── render.yaml
├── summary.md
├── test
└── url endpoints
```

---

## Detailed File Summaries

0001_initial.py : Initial database migration mapping custom User tables and authentication groups.
0002_auditor.py : Migration introducing the Auditor table to the database.
0002_remove_user_is_verified_remove_user_role.py : Migration cleaning redundant validation fields from user properties.
0003_searchtokenindex_external_token.py : Migration updating SearchTokenIndex model with external verification tokens.
0004_externalsearchaudit.py : Migration adding the ExternalSearchAudit registry to track auditor lookup history.
0005_alter_externalsearchaudit_options_and_more.py : Migration applying structural database index and constraint corrections.
0006_alter_auditor_options_and_more.py : Migration adjusting ordering behavior and schema restrictions for auditors.
0007_auditor_designation_auditor_email_auditor_phone_and_more.py : Migration expanding the auditor model to include personal contact fields (email, phone, designation).
API_DOCUMENTATION.md : Detailed REST API documentation detailing endpoints, request formats, response payloads, and schemas.
AdminLayout.jsx : Main page grid setting up sidebar panel and body wrapper layout.
App.css : Primary container layout styling sheet.
App.jsx : Master routing configuration linking UI layouts, user roles, and dashboard views.
Auditors.jsx : IAM admin tab dealing with external auditor accounts.
AuthContext.jsx : Context hook providing login status and token session details across all pages.
CURRENT_STATUS.md : Roadmap status and checklist detailing completed and missing security implementations in the backend application.
CreateAuditorCard.jsx : Wizard interface enabling registration of new external audit credentials.
Dashboard.jsx : Dashboard controller page managing views according to analyst or auditor roles.
DeleteIdentityDialog.jsx : Modal window asking for validation prior to deleting an IAM user profile.
DisableIdentityDialog.jsx : Modal window confirming status shifts (enabled/disabled) on active identities.
Dockerfile : Script containerizing the Django backend service using a Python slim image and Gunicorn.
Documents.jsx : Administrative panel enabling upload and retrieval of raw encrypted items.
EmptyState.jsx : Fallback display UI shown when search filters find zero matching items.
IAM.jsx : Security dashboard managing users, roles, and status levels.
IdentityFilters.jsx : Form components to filter user lists by role, status, or creation bounds.
IdentityModal.jsx : Wizard handling profile creation and key generation for new users.
IdentityRow.jsx : Grid entry layout representing individual IAM details.
IdentitySearch.jsx : Search bar with clean/reset actions for identity filtering.
IdentityTable.jsx : Main tabular view rendering registered IAM user groups.
Loader.jsx : Animated loading spinner component.
LoadingSkeleton.jsx : Animated gray bar panel placeholders mimicking table structures.
Metrics.jsx : Detailed log viewer showing transaction records and key change timelines.
MetricsPage.jsx : Dashboard component rendering usage charts, key rotations, and auditor transaction registries.
Navbar.jsx : Main header navigation bar providing access to pages and user context.
PageHeader.jsx : Standardized title block with page-specific action buttons.
PermissionRoute.jsx : Router guard checking user credentials against target feature permissions.
Profile.jsx : Admin user profile details and self-settings view.
ProtectedRoute.jsx : Router guard validating active JWT validity before launching component views.
README.md : High-level project documentation covering SSE/PEKS logic, database schema, environment setup, and local run instructions.
RoleRoute.jsx : Router guard validating active user role properties.
Search.jsx : Security searching panel providing document lookup views.
SearchPage.jsx : Query search console orchestrating HMAC hash derivation and client-side query signatures.
Settings.jsx : System configurations management board (database seed status, keys, master key status).
Sidebar.jsx : Side navigation panel for admin dashboard operations.
StatCard.jsx : Visual summary block presenting metric parameters and percentage shifts.
StoragePage.jsx : Visual simulator mapping out AES-256 ciphertexts and HMAC inverted index tokens.
Terminal.jsx : Simulated terminal UI displaying debug outputs and background tasks logs.
Toast.jsx : Dynamic notification banner alert.
TopNavbar.jsx : Secondary header navbar supporting admin preferences.
UploadPage.jsx : Input console supporting record encryption and database uploads.
Users.jsx : User management workspace rendering the identity components board.
__init__.py : Package initializer declaring the directory as a Python package module.
admin.py : Django admin panel registration definitions for models in the application.
analytics.js : Client API wrapper retrieving analytic metrics.
api.js : Base Axios setup with request interceptors for attaching JWT authorization headers.
apps.py : App configuration setup class registering the application within Django.
asgi.py : ASGI gateway configuration for asynchronous web server bindings.
auditor.js : Client API wrapper fetching external auditor metrics.
auditorService.js : Client API wrapper updating key variables and rotating external keys.
auditor_service.py : Service layer business logic executing auditor registration, updates, deletions, and key rotation.
auditors.js : Mock data definitions for external auditors used during testing and offline client modes.
auth.js : Client API wrapper executing logins, password updates, and token refreshes.
authentication.md : Detailed overview of the authentication and authorization design (JWT for users, RSA signature verification for external auditors).
constants.py : Shared lists of static configurations, features, roles, or searchable document fields.
credential_service.py : Service compiling access credentials and preparing RSA certificate details for download.
crypto.js : Browser Cryptography wrapper applying WebCrypto API routines for SHA-256 and RSA-PSS.
dashboard.js : Mock data representing dashboard statistics and metrics for visual presentation.
documents.js : Client API wrapper managing raw documents querying and deletions.
errorHandler.js : Axios interceptor converting server status codes to clean messages.
errors.js : Standardized application-side error codes definitions.
eslint.config.js : Javascript rules syntax checker and styling configuration framework.
exception_handler.py : Custom middleware exception hook converting system errors into clean API messages.
externalSearchService.js : Client API wrapper executing client-side RSA signing and querying external routes.
features.js : Static definitions of distinct system features and options.
filestructure.md : Comprehensive directory tree and summary mapping for the entire project.
identities.js : Mock data representing system user identities and roles for the IAM views.
identity.js : Client API wrapper executing IAM user registration and updates.
index.css : Root stylesheet loading custom Tailwind variables and global page configurations.
index.html : Vite HTML wrapper mounting the React application.
index.js : 디자인 시스템 (Design System) module exporter listing all atomic UI buttons/cards/badges.
index.jsx : Reusable atomic UI component wrapper implementation for layouts (Button, Card, Input, Table, etc.).
internalSearchService.js : Client API wrapper querying internal SSE endpoints.
key_manager.py : Cryptographic operations deriving subkeys from MASTER_KEY using HKDF-SHA256.
key_service.py : Service managing cryptographic master key parsing, derivation, and validation checks.
log_export_service.py : Service exporting query metrics and logs into raw formats.
main.jsx : Virtual DOM root mounting scripts.
manage.py : Django administrative utility CLI wrapper script.
models.py : Django ORM model class mapping database tables to Python objects.
package.json : NPM package definition listing frontend dependencies, run commands, and compiler options.
pdf_generator.py : Service generating PDF report certificates and audit logs for download.
peks.py : RSA key pair generator, trapdoor generator, and signature verification utility functions for PEKS.
permissions.js : Application permissions map allocating features to selected user groups.
permissions.py : Custom Django REST Framework permissions classes implementing Role-Based Access Control (RBAC).
render.yaml : Render cloud configuration mapping backend, frontend, and database services for containerized deployment.
requirements.txt : List of backend dependencies including Django, DRF, simplejwt, cryptography, psycopg2-binary, and whitenoise.
roles.js : Static roles enum mapping roles to corresponding ID constants.
routes.js : React Router path layout definitions.
search.js : Unified client search endpoints wrapper.
serializers.py : Django REST Framework serializers transforming query models and payloads into/from JSON.
settings.js : Client API wrapper fetching system health and configuration flags.
settings.py : Main Django settings module containing database configs, JWT settings, rate throttles, and middleware setup.
signals.py : Event handler hooks executing actions (like profile syncs) on user model triggers.
sse.py : Symmetric Searchable Encryption logic utilizing AES-256-GCM and HMAC-SHA256 for index generation.
status.js : Entity state constants detailing visual indicators mapping.
summary.md : Architecture and design documentation detailing backend models, cryptographic mechanisms, and frontend layout structures.
test : Sample PEM RSA private key file used for testing auditor signature verification.
tests.py : Unit and integration tests validating the accuracy of the application view routes and helper functions.
uploadService.js : Client API wrapper posting document records.
url endpoints : Reference document mapping out the available HTTP request endpoints across the backend APIs.
urls.py : Routing maps linking application-specific sub-paths to their view classes.
useAuditors.js : Custom hook handling auditor lists and key operations.
useDashboard.js : Custom hook fetching metrics cards.
useIdentity.js : Custom hook handling pagination and search state for the IAM grid.
usePermissions.js : Helper hook validation rules matching active user properties against features.
utils.py : Reusable helper routines like standardized API success/error formatting and key normalizations.
views.py : HTTP controllers handling request payloads, checking permissions, and returning JSON responses.
vite.config.js : Configuration setting up Vite plugins, Tailwind variables integration, and proxy paths.
wsgi.py : WSGI gateway configuration for standard web server execution.
