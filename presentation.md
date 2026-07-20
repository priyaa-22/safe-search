# Safe Search Presentation

## 1. Title

**Safe Search: Privacy-Preserving Search Over Encrypted Data**

- Project type: Secure searchable-encryption web application
- Stack: Django REST Framework + React/Vite + PostgreSQL
- Core goal: Store sensitive records in encrypted form while still allowing controlled search

---

## 2. Executive Summary

Safe Search is a full-stack prototype that demonstrates how sensitive records can remain encrypted at rest while still supporting operational search workflows.

The system supports two different search models:

- **Internal secure search**
  - Trusted internal users can upload documents, trigger encrypted indexing, and search exact-match fields.
  - Matching records are decrypted only for authorized internal users.

- **External auditor search**
  - External auditors cannot freely search plaintext data.
  - They must authenticate and prove authorization using RSA signatures.
  - They receive padded encrypted results rather than decrypted documents.

This makes the project suitable as a reference implementation for privacy-aware enterprise search, secure audit workflows, and applied cryptography demos.

---

## 3. Problem Statement

Organizations often need to search sensitive customer or compliance data, but storing that data in plaintext increases operational and security risk.

Traditional systems usually force a poor tradeoff:

- If data is encrypted strongly, search becomes difficult.
- If search is convenient, plaintext exposure increases.

Safe Search addresses this gap by demonstrating:

- encrypted document storage
- deterministic secure indexing for selected fields
- role-based access control
- internal and external search separation
- auditable external search behavior

---

## 4. Project Objectives

The main objectives of the project are:

1. Encrypt uploaded records before storing them in the database.
2. Support exact-match secure search on selected fields.
3. Separate internal operational users from external auditors.
4. Enforce role-based access control across APIs and UI.
5. Provide an auditable, cryptographically verified external query flow.
6. Demonstrate deployment readiness using Docker and Render-style hosting.

---

## 5. High-Level Idea

The project uses two complementary secure search approaches:

### A. Internal Search: SSE-Inspired Flow

- Internal analysts upload plaintext JSON records.
- The backend encrypts the entire record using AES-256-GCM.
- For selected searchable fields, the backend generates deterministic HMAC-based tokens.
- During search, the same token-generation logic is applied to the query.
- Matching encrypted records are retrieved and decrypted for authorized internal users.

### B. External Search: PEKS-Inspired Flow

- External auditors do not receive plaintext records.
- Search terms are normalized and converted into deterministic SHA-256 hashes.
- The auditor must sign the search hash using their private RSA key.
- The backend verifies the signature using the stored public key and active key version.
- If valid, the backend returns fixed-size padded encrypted results and logs the event.

---

## 6. What Makes This Project Distinct

- Sensitive records are not stored as plaintext rows.
- Search is possible without exposing all data in cleartext.
- Internal and external users have intentionally different capabilities.
- External search is protected with public-key verification and audit logs.
- The project combines cryptography, backend APIs, frontend UX, access control, and deployment concerns in one system.

---

## 7. Core User Roles

The backend defines the following roles:

- `Administrator`
- `Internal Analyst`
- `Compliance Officer`
- `External Auditor`
- `Read Only Analyst`
- `No Role Assigned`

### Role responsibilities

- **Administrator**
  - Full system administration
  - Manage users and auditors
  - Rotate auditor keys
  - View metrics and protected data

- **Internal Analyst**
  - Upload documents
  - Run internal secure searches

- **Compliance Officer**
  - View metrics
  - Review auditor logs
  - Inspect auditor records

- **External Auditor**
  - Perform cryptographically verified external search
  - Verify active credentials

- **Read Only Analyst**
  - Perform internal searches
  - Does not manage system data

---

## 8. End-to-End User Journeys

### Journey 1: Internal upload

1. Internal user logs in with JWT.
2. User submits a JSON document.
3. Backend encrypts the document.
4. Backend creates secure search tokens for allowed fields.
5. Encrypted document and tokens are stored in PostgreSQL.

### Journey 2: Internal secure search

1. Internal user logs in.
2. User submits one or more field/value pairs.
3. Backend creates deterministic HMAC tokens for each query field.
4. Matching document IDs are intersected.
5. Matching documents are decrypted and returned.

### Journey 3: External auditor search

1. Auditor account is created with RSA keypair generation.
2. Auditor receives private key one time only.
3. Auditor signs the keyword hash.
4. Auditor sends `auditor_id`, `key_version`, `keyword_hash`, and `signature`.
5. Backend verifies signature and key version.
6. Backend returns padded encrypted results and writes an audit log.

---

## 9. System Architecture

### Frontend

- React 19 + Vite SPA
- Tailwind-based component styling
- Role-aware routes and dashboards
- Axios-based service layer

### Backend

- Django REST Framework
- JWT authentication with Simple JWT
- Custom role-based permission classes
- AES/HMAC/RSA cryptographic helpers
- PostgreSQL persistence

### Database

- Encrypted documents
- Search token index
- Auditor identities and public keys
- External search audit events

### Deployment

- Dockerized backend
- Render deployment configuration
- Vercel-compatible frontend setup

---

## 10. Repository Structure

### Root

- `README.md`
- `summary.md`
- `authentication.md`
- `filestructure.md`
- `render.yaml`
- `presentation.md`

### Backend

- `backend/securematch/securematch/`
  - Django settings, URL routing, ASGI/WSGI
- `backend/securematch/accounts/`
  - User model, auth views, permissions, serializers
- `backend/securematch/documents/`
  - Search, upload, auditor management, metrics, PDFs
- `backend/securematch/crypto_engine/`
  - AES/HMAC/RSA helpers

### Frontend

- `frontend/src/App.jsx`
- `frontend/src/pages/admin/`
- `frontend/src/components/`
- `frontend/src/hooks/`
- `frontend/src/services/`

---

## 11. Backend Technology Stack

- Python
- Django
- Django REST Framework
- `djangorestframework-simplejwt`
- `django-cors-headers`
- `cryptography`
- `psycopg2-binary`
- `python-dotenv`
- `gunicorn`
- `whitenoise`

---

## 12. Frontend Technology Stack

- React
- Vite
- Axios
- Custom hooks
- Context API for auth state
- Reusable UI components

Frontend responsibilities include:

- login and session handling
- protected route rendering
- auditor management UI
- dashboard and metrics screens
- internal and external search experiences

---

## 13. Data Model

The project stores four main domain entities.

### 1. `EncryptedDocument`

Purpose:

- Stores the encrypted JSON payload

Fields:

- `encrypted_blob`
- `created_at`

Notes:

- plaintext is not persisted directly
- encrypted blob contains nonce and ciphertext

### 2. `SearchTokenIndex`

Purpose:

- Maps secure tokens to documents

Fields:

- `token`
- `external_token`
- `document`

Notes:

- `token` is used for internal HMAC-based search
- `external_token` is used for external deterministic-hash search

### 3. `Auditor`

Purpose:

- Represents an external authority allowed to perform signed searches

Fields include:

- `name`
- `organization_name`
- `organization_code`
- `username`
- `temp_password`
- `email`
- `phone`
- `designation`
- `status`
- `public_key`
- `key_version`
- `last_rotation`
- `created_at`
- `updated_at`

### 4. `ExternalSearchAudit`

Purpose:

- Captures every important external auditor event

Fields include:

- `auditor`
- `keyword_hash`
- `total_matches`
- `returned_count`
- `truncated`
- `execution_time_ms`
- `success`
- `failure_reason`
- `key_version`
- `ip_address`
- `event_type`
- `performed_by`
- `metadata`
- `created_at`

Event coverage includes:

- auditor created
- key generated
- key rotated
- account updated
- account deleted
- credentials downloaded
- external search

---

## 14. Searchable Fields

The backend currently indexes exact-match search tokens for:

- `pan`
- `compliance_flag`
- `name`
- `customer_id`
- `aadhaar`

Important implication:

- A document may contain more fields than these.
- The entire document is encrypted and stored.
- Only the listed fields are searchable through the secure index.

---

## 15. Authentication Design

The system uses JWT-based authentication for normal users.

### Implemented auth features

- login
- logout
- refresh token flow
- current-user endpoint
- password change
- refresh-token rotation
- refresh-token blacklisting

### JWT configuration

- Access token lifetime: 15 minutes
- Refresh token lifetime: 7 days
- Refresh rotation: enabled
- Blacklisting after rotation: enabled

### Why this matters

- short-lived access tokens reduce risk
- refresh tokens support usability
- rotation and blacklist improve token hygiene

---

## 16. Role-Based Access Control

Access control is implemented using:

- Django groups
- role resolution helpers
- custom DRF permission classes

This ensures:

- only admins can manage users and auditors
- only internal users can run decrypted internal search
- only auditors or admins can perform external auditor workflows
- compliance users can inspect metrics and logs

---

## 17. Cryptographic Design

### Internal cryptography

The internal search path uses:

- HKDF-SHA256 key derivation
- AES-256-GCM for encryption
- HMAC-SHA256 for deterministic search tokens

Flow:

1. `MASTER_KEY` is loaded from environment.
2. Two subkeys are derived:
   - AES key
   - HMAC key
3. Document JSON is encrypted with AES-GCM.
4. Searchable fields are converted to deterministic HMAC tokens.

### External cryptography

The external search path uses:

- SHA-256 deterministic keyword hashing
- RSA keypair generation
- RSA-PSS signatures
- public-key verification on the server

Important note:

- The implementation is PEKS-inspired, not a formal pairing-based PEKS construction.
- It is best described as deterministic public hashing plus signed authorization.

---

## 18. Why AES-GCM Was Used

AES-GCM was chosen because it provides:

- confidentiality
- integrity
- authenticated encryption
- practical performance for JSON payloads

This means the server can detect tampering with encrypted blobs during decryption.

---

## 19. Why Deterministic Tokens Were Used

Secure search requires repeatable matching.

That means:

- if the same field/value pair appears again, the same token must be produced
- the token must not expose the raw value directly

The project solves this using HMAC tokens for internal search and SHA-256 hashes for external lookup.

Tradeoff:

- exact-match search is possible
- fuzzy or prefix search is not supported in the current design

---

## 20. Internal Search Flow in Detail

### Input

- one or more field/value pairs

### Processing

1. Normalize each value by trimming and lowercasing.
2. Generate HMAC token for `field:value`.
3. Query indexed token rows.
4. Intersect document sets for multi-field search.
5. Load encrypted documents.
6. Decrypt each match.
7. Return plaintext results only to authorized internal roles.

### Security property

- search can be performed without storing the searchable fields in plaintext columns

---

## 21. External Auditor Search Flow in Detail

### Inputs

- `auditor_id`
- `key_version`
- `keyword_hash`
- `signature`

### Processing

1. Load auditor public key and active key version.
2. Reject if auditor is disabled.
3. Reject if key version mismatches.
4. Verify signature using RSA-PSS.
5. Search matching `external_token` entries.
6. Return encrypted results only.
7. Pad output to a fixed size.
8. Write `ExternalSearchAudit` log.

### Security property

- the backend verifies that the auditor is authorized to search for that specific hashed keyword

---

## 22. Result Padding Strategy

The external auditor flow pads results to a fixed size of **50 items**.

Why:

- without padding, the result count itself can leak information
- a rare keyword and a common keyword would produce noticeably different response sizes

Padding reduces this side-channel by returning a constant-size response structure.

---

## 23. Auditor Lifecycle Management

The system supports the full operational lifecycle for auditors:

- create auditor
- generate credentials
- view profile
- update account data
- change active/disabled status
- rotate keys
- download credentials
- delete account
- inspect activity logs
- export logs as PDF

This makes the project more than a crypto demo. It is also an operational identity workflow for external authorities.

---

## 24. Key Rotation

Auditor key rotation is implemented through dedicated endpoints and services.

### Rotation behavior

- a new RSA keypair is generated
- `key_version` is incremented
- new private key is returned once
- backend stores the new public key
- future searches must use the new version

Why this matters:

- limits long-term exposure
- supports credential renewal
- demonstrates key lifecycle handling

---

## 25. Audit Logging

The project records external-security-relevant events through `ExternalSearchAudit`.

What is logged:

- external search activity
- success or failure status
- execution time
- match counts
- truncation behavior
- key version used
- actor metadata
- credential lifecycle events

Why this matters:

- accountability
- compliance visibility
- incident investigation
- demo-ready observability for auditor workflows

---

## 26. API Design

All backend endpoints are mounted under `/api/`.

### Authentication APIs

- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `POST /api/auth/change-password/`

### User management APIs

- `GET /api/users/`
- `POST /api/users/`
- `GET /api/users/<pk>/`
- `PATCH /api/users/<pk>/`
- `DELETE /api/users/<pk>/`

### Core document/search APIs

- `GET /api/health/`
- `POST /api/upload/`
- `POST /api/search/internal/`
- `POST /api/search/external/`

### Auditor lifecycle APIs

- `POST /api/auditor/create/`
- `POST /api/auditor/verify/`
- `POST /api/auditor/rotate-key/`
- `DELETE /api/auditor/<auditor_id>/delete/`
- `GET /api/auditor/<auditor_id>/download/`
- `GET /api/auditor/<auditor_id>/logs/`
- `GET /api/auditor/<auditor_id>/logs/download/`

### REST-style auditor APIs

- `GET /api/auditors/`
- `POST /api/auditors/`
- `GET /api/auditors/<id>/`
- `PATCH /api/auditors/<id>/`
- `PUT /api/auditors/<id>/`
- `DELETE /api/auditors/<id>/`
- `POST /api/auditors/<id>/rotate-key/`
- `GET /api/auditors/<id>/credentials/`

### Metrics APIs

- `GET /api/metrics/internal/`
- `GET /api/metrics/external/`

---

## 27. Response Style

Most endpoints use a standard envelope:

```json
{
  "status": "success",
  "data": {},
  "meta": {}
}
```

Errors are generally normalized into:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

This improves frontend consistency and debugging.

---

## 28. Frontend Overview

The frontend is a role-aware single-page application.

### Major frontend areas

- landing and login flows
- admin dashboard
- IAM and user management
- auditor management
- metrics and reporting
- document upload
- internal search
- profile and settings pages

### Notable implementation points

- custom auth context
- token-aware Axios interceptor
- local route management
- shared UI component library
- custom hooks such as `useAuditors`, `useIdentity`, and `useDashboard`

---

## 29. Auditor Management UI

The auditors page is one of the strongest parts of the frontend.

It supports:

- creating auditors
- searching and filtering auditors
- viewing profile details
- enabling and disabling accounts
- deleting auditors
- rotating keys
- downloading credential packages
- browsing activity logs
- exporting logs as PDF

From a presentation perspective, this is one of the best screens to demo because it clearly combines security, operations, and usability.

---

## 30. Internal Operations UI

The internal UI supports operational tasks such as:

- selecting internal identities
- secure login
- document upload
- exact secure search
- dashboard metrics
- administrative actions based on role

This demonstrates that the project is not only a backend API but a usable end-to-end application.

---

## 31. Security Controls Implemented

The project already includes several important controls:

- JWT auth
- refresh-token rotation
- refresh-token blacklist
- role-based access control
- password hashing via Django
- password validation
- request throttling
- AES-256-GCM encryption
- HMAC-based tokenization
- RSA keypair generation
- RSA-PSS signature verification
- key version checks
- padded external responses
- auditor lifecycle logs
- PostgreSQL SSL mode
- CORS configuration
- custom exception handling

---

## 32. Operational Deployment

### Backend deployment

- Dockerized
- Gunicorn-ready
- WhiteNoise for static file handling
- `render.yaml` present for Render deployment

### Environment-driven configuration

The backend depends on values such as:

- `SECRET_KEY`
- `MASTER_KEY`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DEBUG`

### Production note

- `MASTER_KEY` is critical
- if it changes, previously encrypted data and token generation become incompatible

---

## 33. Health and Metrics

The project includes:

- health check endpoint
- internal metrics endpoint
- external metrics endpoint
- external search timing capture

This helps demonstrate:

- basic observability
- operational monitoring
- system readiness checks

---

## 34. Testing and Validation

The repository includes backend tests for:

- authentication
- role-based access control
- user management
- health checks
- auditor profile APIs
- auditor REST endpoints
- credential downloads
- log downloads

Testing is present and useful, though not yet complete for every crypto and integration path.

---

## 35. Major Strengths of the Project

### 1. Clear separation of trust levels

Internal users and external auditors do not share the same access path.

### 2. Real applied cryptography

The project uses practical encryption, tokenization, and signature verification rather than mock security.

### 3. End-to-end implementation

It includes backend, frontend, database design, authentication, crypto, and deployment.

### 4. Operational completeness around auditors

The auditor lifecycle is unusually well-covered for a prototype.

### 5. Strong demo value

The system has multiple presentation-friendly workflows:

- upload
- internal search
- external auditor verification
- key rotation
- log inspection

---

## 36. Limitations

This is a strong prototype, but it is not fully production hardened.

Current limitations include:

- no email verification
- no password reset flow
- no session/device tracking
- no login history
- no master-key rotation workflow
- no envelope encryption
- no HSM or KMS integration
- no fuzzy/prefix/range search
- no pagination for large list endpoints
- no Redis or background jobs
- no CI/CD pipeline in repo
- no full HTTPS hardening settings
- incomplete structured logging and alerting

---

## 37. Security Tradeoffs

This project intentionally chooses practicality over formal perfection.

### Benefits

- understandable design
- implementable with mainstream tools
- good academic and engineering demonstration value
- supports exact search with encrypted storage

### Tradeoffs

- deterministic search leaks some equality patterns
- external search is PEKS-inspired rather than formal PEKS
- exact-match only
- one master-key-derived symmetric design limits advanced key lifecycle features

These tradeoffs should be stated clearly during presentation because they show technical maturity rather than weakness.

---

## 38. Future Improvements

If this project were extended, the next major upgrades should be:

### Security

- envelope encryption
- master key rotation
- HSM/KMS integration
- stronger HTTPS hardening
- broader audit coverage

### Product

- fuzzy or prefix search research
- pagination
- saved searches
- richer dashboard analytics
- user activity history

### Engineering

- CI/CD pipelines
- Docker Compose for local orchestration
- Redis caching
- background workers
- broader automated test coverage

---

## 39. Suggested Demo Flow

For a live presentation, the strongest order is:

1. Explain the problem: searching sensitive data without storing it in plaintext.
2. Show architecture diagram or stack overview.
3. Log in as administrator.
4. Show user roles and auditor management.
5. Create an auditor and explain one-time private key delivery.
6. Upload a sample sensitive document.
7. Run an internal secure search and show decrypted results.
8. Explain why external users do not get the same response.
9. Show external auditor workflow and signed-query idea.
10. Show activity logs and PDF exports.
11. Explain key rotation and why versioning matters.
12. Close with limitations and future work.

---

## 40. Suggested Slide Deck Outline

If you want to convert this into slides, use this order:

1. Title
2. Problem Statement
3. Solution Overview
4. System Architecture
5. User Roles
6. Data Flow
7. Cryptographic Design
8. Internal Search Workflow
9. External Auditor Workflow
10. Data Models
11. API Surface
12. Frontend Screens
13. Security Features
14. Deployment and DevOps
15. Strengths
16. Limitations
17. Future Work
18. Conclusion

---

## 41. Viva / Interview Questions You May Be Asked

### Why not store plaintext?

Because plaintext storage increases the blast radius of database compromise and insider misuse.

### Why exact search only?

Because deterministic secure search is much easier to implement safely than fuzzy or ranked encrypted search.

### Why use both HMAC and SHA-256?

HMAC protects internal searchable tokens using a secret key, while SHA-256 supports deterministic public hashing for the external auditor flow.

### Why use RSA signatures for auditors?

Because the backend must verify that the search request was authorized by the holder of the private key tied to the auditor identity.

### Why pad external results?

To reduce information leakage through response size.

### Is this production ready?

Not fully. It is best described as a secure prototype or reference implementation with strong foundations and clear next steps.

---

## 42. Key Technical Takeaways

- Searchable encryption can be demonstrated practically in a web app.
- Internal and external trust models should not be treated the same.
- Security is not only encryption. It also includes identity, permissions, auditability, and operational controls.
- Production security requires lifecycle thinking: key rotation, logs, monitoring, deployment hardening, and controlled access paths.

---

## 43. Conclusion

Safe Search is a meaningful full-stack security project that combines:

- encrypted storage
- deterministic secure indexing
- internal decrypted search
- external signed search authorization
- role-based access control
- auditor lifecycle management
- audit logging
- deployment-aware engineering

It demonstrates both software engineering breadth and security-focused system design.

If presented clearly, this project shows strength in:

- backend engineering
- frontend integration
- applied cryptography
- access control
- API design
- deployment understanding

---

## 44. Short Closing Statement

Safe Search shows how encrypted storage and practical search can coexist when access is split by trust level, cryptographic verification is enforced, and operations are designed with auditability in mind.
