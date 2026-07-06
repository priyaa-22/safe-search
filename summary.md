# Safe Search Project Summary

## Overview

`safe-search` is a privacy-focused searchable-encryption demo built as a split-stack web application:

- A Django REST backend stores documents only in encrypted form and exposes APIs for upload, search, auditor management, and metrics.
- A React + Vite frontend provides two role-based user flows:
  - `Internal Analyst`: can upload plaintext records, trigger encrypted indexing, run internal secure searches, and view system metrics.
  - `External Auditor`: can search for the existence of data through a public-key-based verification flow without receiving decrypted records.

The project demonstrates two complementary search models:

- `SSE` (Symmetric Searchable Encryption) for trusted internal users.
- A `PEKS-inspired` external search flow that uses deterministic hashing plus RSA signatures to authenticate auditor requests.

The repo is best understood as a reference implementation or academic/prototype system rather than a production-ready platform.

## Repository Layout

- `backend/`
  - Django project `securematch`
  - Main business logic in `backend/securematch/documents/`
  - Crypto helpers in `backend/securematch/crypto_engine/`
  - Containerization via `backend/Dockerfile`
- `frontend/`
  - React 19 + Vite SPA
  - Tailwind CSS v4 enabled through Vite plugin
  - UI code in `frontend/src/`
- Root files
  - `README.md`: high-level project description and setup notes
  - `render.yaml`: Render deployment definition for backend
  - `url endpoints`: quick local API reference
  - `HDFC`, `ICICI`, `IDFC`, `LIC`: standalone private key files used as sample auditor credentials or test assets

## Product Purpose

The system is designed to let a backend store sensitive records without retaining plaintext at rest, while still supporting exact-match lookup on selected fields.

It separates search capability by trust level:

- Internal users can search indexed fields and receive fully decrypted matching documents.
- External auditors can prove they are authorized to ask for a keyword by signing a hash with their private key. They then receive fixed-size encrypted results and metadata, but not plaintext.

This architecture is intended to reduce accidental plaintext exposure while still enabling operational search and compliance/audit workflows.

## Backend Summary

### Framework and Runtime

The backend is a Django application using:

- `Django`
- `djangorestframework`
- `django-cors-headers`
- `cryptography`
- `psycopg2-binary`
- `python-dotenv`
- `gunicorn`
- `whitenoise`

The project is configured for PostgreSQL, with Render deployment and Neon-style managed Postgres implied by the settings and `.env`.

### Django Project Structure

Main project files:

- `backend/securematch/manage.py`
- `backend/securematch/securematch/settings.py`
- `backend/securematch/securematch/urls.py`
- `backend/securematch/securematch/asgi.py`
- `backend/securematch/securematch/wsgi.py`

App structure:

- `documents`: API endpoints, models, response helpers, constants
- `crypto_engine`: encryption, key derivation, RSA utilities

### Backend Configuration

`settings.py` contains the main runtime configuration:

- Loads environment variables from `backend/.env`
- Uses PostgreSQL only; there is no SQLite fallback
- Enables CORS for local frontend ports and one deployed Vercel frontend
- Allows Render hosts in `ALLOWED_HOSTS`
- Serves static assets using WhiteNoise
- Applies DRF scoped throttling:
  - `search`: `10/minute`
  - `upload`: `200/minute`

Security/configuration assumptions:

- `SECRET_KEY`, database credentials, and `MASTER_KEY` must be present
- `MASTER_KEY` is required at import time by the crypto layer

### Data Model

The backend persists four core models in `documents/models.py`.

#### 1. `EncryptedDocument`

Purpose:

- Stores the encrypted representation of a user-submitted record.

Structure:

- `encrypted_blob`: JSON containing `nonce` and `ciphertext`
- `created_at`

Behavior:

- Documents are ordered newest-first.
- Plaintext is not persisted in a model field.

#### 2. `SearchTokenIndex`

Purpose:

- Maintains searchable token mappings from exact-match fields to documents.

Structure:

- `token`: internal SSE token, field-bound HMAC digest
- `external_token`: deterministic external hash for auditor search
- `document`: foreign key to `EncryptedDocument`

Behavior:

- Each indexed field generates one `SearchTokenIndex` row.
- Supports both internal and external search from the same document corpus.

#### 3. `Auditor`

Purpose:

- Represents an external identity allowed to perform signed searches.

Structure:

- `name`
- `public_key`
- `key_version`
- `created_at`

Behavior:

- Supports key rotation by incrementing `key_version`.

#### 4. `ExternalSearchAudit`

Purpose:

- Records every external auditor search attempt.

Structure includes:

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
- `created_at`

Behavior:

- Ordered newest-first
- Indexed for auditor, timestamp, success state, and keyword hash
- Used to support metrics and auditability

### Searchable Fields

The upload/indexing flow only indexes fields listed in `documents/constants.py`:

- `pan`
- `compliance_flag`
- `name`
- `customer_id`
- `aadhaar`

Any other fields in uploaded JSON may still be encrypted and stored inside the document blob, but they will not be searchable through the token index.

### Crypto Layer

The cryptographic implementation lives in `backend/securematch/crypto_engine/`.

#### Symmetric Searchable Encryption Logic

Implemented in `sse.py`:

- Loads `MASTER_KEY` from environment
- Derives two subkeys using HKDF-SHA256:
  - `AES_KEY`
  - `HMAC_KEY`
- Encrypts document JSON using `AES-256-GCM`
- Generates deterministic HMAC-SHA256 tokens for `field:value`
- Uses the same token-generation logic for indexing and search trapdoors

Important details:

- Values are normalized by trimming and lowercasing
- Tokens are field-bound, so identical values in different fields do not collide
- AES-GCM nonce is randomly generated per document

#### External Auditor Search Logic

Implemented in `peks.py`:

- Normalizes keyword with lowercase + trim
- Hashes it using deterministic SHA-256
- Supports RSA keypair generation
- Signs the keyword hash with RSA-PSS using the private key
- Verifies the signature using stored auditor public key

This is PEKS-inspired, but the implementation is closer to:

- deterministic public hash lookup
- signature-authenticated query authorization

It is not a formal full PEKS implementation with pairing-based cryptography.

#### Master Key Management

Implemented in `key_manager.py`:

- Reads `MASTER_KEY` from environment
- Expects base64-decoded size of exactly 32 bytes
- Derives two 32-byte subkeys via HKDF

Operational implication:

- If `MASTER_KEY` changes, existing encrypted documents and token generation become incompatible with previous data.

### API Surface

All backend endpoints are mounted under `/api/`.

#### `POST /api/upload/`

Purpose:

- Accepts a JSON document from the internal workflow.

Behavior:

- Validates request body is a JSON object
- Encrypts the whole document
- Creates `EncryptedDocument`
- Iterates over searchable fields
- Generates:
  - internal HMAC token
  - external SHA-256 token
- Creates one `SearchTokenIndex` row per indexed field

Response:

- Success message only
- No plaintext echo

#### `POST /api/search/internal/`

Purpose:

- Internal exact-match search with decrypted results.

Behavior:

- Accepts a JSON object of field-value filters
- Generates a trapdoor token for each query pair
- Fetches matching document IDs per token
- Intersects results across fields for AND semantics
- Limits output to `MAX_INTERNAL_RESULTS = 50`
- Decrypts matching encrypted blobs before returning

Response metadata includes:

- `total_matches`
- `returned_count`
- `truncated`
- `execution_time_ms`

This is the most privileged read path in the system because it returns plaintext data back to the caller.

#### `POST /api/search/external/`

Purpose:

- External auditor search with signature verification and encrypted-only results.

Inputs:

- `auditor_id`
- `keyword_hash`
- `signature`

Behavior:

- Validates required fields
- Loads the auditor by ID
- Verifies RSA-PSS signature over the provided `keyword_hash`
- Looks up matches using `external_token`
- Returns encrypted blobs only as `nonce` + `ciphertext`
- Pads the result set to fixed size `50`
- Logs the request in `ExternalSearchAudit`
- Computes hourly search frequency metadata

Response metadata includes:

- `total_matches`
- `returned_count`
- `truncated`
- `execution_time_ms`
- `signature_verification_ms`
- `audit_log_id`
- `searches_last_hour`
- `key_version_used`
- `response_padded`

Security property demonstrated:

- The external user can learn whether matches exist and receive ciphertext objects, but does not receive backend decryption support.

#### `POST /api/auditor/create/`

Purpose:

- Creates a new external auditor identity.

Behavior:

- Requires `name`
- Generates RSA keypair on the server
- Stores the public key
- Returns:
  - `auditor_id`
  - `name`
  - `public_key`
  - `private_key`
  - `key_version`

The private key is intentionally returned once so the frontend can display it for secure storage.

#### `POST /api/auditor/rotate-key/`

Purpose:

- Rotates an auditor keypair.

Observed implementation:

- `documents/views.py` defines `RotateAuditorKeyView` twice
- The later definition overrides the earlier one at import time
- Effective behavior is:
  - accept `auditor_id`
  - generate a new RSA keypair
  - replace stored public key
  - increment key version
  - return new public/private keys

This is a code-quality issue worth noting because the earlier class suggests an older contract using `new_public_key`, but that code is dead in practice.

#### `GET /api/auditor/<auditor_id>/logs/`

Purpose:

- Returns the latest external search audit entries for one auditor.

Behavior:

- Loads the auditor
- Returns up to 100 logs

#### `DELETE /api/auditor/<auditor_id>/delete/`

Purpose:

- Removes an auditor entry from the system.

Behavior:

- Deletes the auditor and related foreign-key data by cascade

#### `GET /api/metrics/internal/`

Purpose:

- Provides broader operational metrics for internal users.

Returns:

- total documents
- total token rows
- external token count
- average external search latency
- external searches in the last 24h
- failed external searches in the last 24h
- last index update time
- registered auditors and active key versions

Also implements:

- `HEAD` support for health checks / uptime probes

#### `GET /api/metrics/external/`

Purpose:

- Exposes limited metrics to external users.

Current response:

- total document count only

### Response Format

`documents/utils.py` provides standard wrappers:

- `success_response(data, meta)`
- `error_response(code, message, details)`

Most user-facing endpoints return:

- `status: success` with `data` and `meta`
- or `status: error` with structured error fields

Not all endpoints use the wrapper consistently. The metrics endpoints, for example, return more direct response shapes in some branches.

### Backend Strengths

- Clear separation between internal and external search modes
- Encryption and token generation are centralized rather than spread through views
- Result padding in external search attempts to reduce response-size leakage
- Audit logging is built into the external flow
- Metrics API exposes enough data for a demo dashboard

### Backend Limitations and Risks

- No authentication or authorization framework is actually enforced for internal users
- `AllowAny` is explicitly set on the active key rotation view
- The frontend role model is UI-only; backend trust boundaries are weak
- Exact-match indexing only; no fuzzy, prefix, range, or partial search
- Upload endpoint indexes only one token per field value
- External deterministic hashing leaks equality across identical keywords
- The external flow returns ciphertext objects for matched documents, which may or may not be intended depending on threat model
- No pagination for large result sets beyond hard truncation
- Exception handling is broad and often suppresses useful debug detail
- Tests are effectively absent
- `views.py` contains duplicate class definitions and a duplicate route entry
- `failure_reason` and `ip_address` exist on the audit model but are not meaningfully populated in the shown flow

## Frontend Summary

### Stack

The frontend uses:

- `React 19`
- `Vite`
- `axios`
- `Tailwind CSS v4`

Styling is mostly utility-class-driven. `App.css` is empty, and `index.css` only imports Tailwind.

### Frontend Architecture

Main files:

- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/`
- `frontend/src/services/`
- `frontend/src/utils/`

The app is a small SPA with stateful role selection in the top-level `App` component.

### App Entry and Role Selection

`App.jsx` is responsible for:

- initial landing screen
- selecting internal vs external mode
- fetching the auditor list when external mode is chosen
- capturing the auditor private key pasted by the user
- passing role context into `Dashboard`

There is no persistent session handling, auth token handling, or route-based navigation. The app is essentially a single-page role simulator with conditional rendering.

### Dashboard and Navigation

`Dashboard.jsx` controls the active tab:

- internal default tab: `upload`
- external default tab: `search`

`Navbar.jsx` renders:

- desktop and mobile navigation variants
- tabs:
  - `Upload` for internal users only
  - `Search`
  - `Metrics`
- role badge
- logout button

The mobile navigation uses a simple hamburger menu with local state.

### Upload Experience

`UploadPage.jsx` is the internal data-ingestion UI.

Key behavior:

- Supports two input modes:
  - manual form entry
  - raw JSON paste
- Includes a sample data loader
- Posts to `/api/upload/`
- Shows simulated pipeline logs to explain what the backend is doing

Fields captured in the default form:

- `customer_id`
- `name`
- `pan`
- `aadhaar`
- `compliance_flag`

UI framing emphasizes:

- AES-256-GCM encryption
- HMAC-SHA256 indexing
- secure storage concept

This page is mostly an educational/demo interface around the upload API.

### Search Experience

`SearchPage.jsx` supports both role modes.

#### Internal Search UI

Behavior:

- Lets the user choose one searchable field
- Accepts one query value
- Sends `{ [field]: query }` to `/api/search/internal/`
- Displays decrypted JSON results
- Shows activity logs such as trapdoor generation and request submission

This is a thin client around the backend SSE search endpoint.

#### External Search UI

Behavior:

- Requires selected auditor identity and pasted private key
- Normalizes the keyword in-browser
- Computes SHA-256 hash in-browser
- Signs the hash with RSA-PSS in-browser using Web Crypto
- Sends signed search request to `/api/search/external/`
- Displays summary metadata instead of plaintext

Notable security design choice:

- The external private key is never generated on the client, but it is used on the client for signing through browser crypto APIs.

### Metrics Experience

`MetricsPage.jsx` branches by role.

#### Internal Metrics View

Displays:

- total documents
- total tokens
- average external search time
- external searches in the last 24h
- auditor list and active key versions
- failed signature verification count
- index health / last update

Also embeds `CreateAuditorCard`, allowing internal users to provision auditors from the UI.

#### External Metrics View

Displays:

- only total document count

This matches the backend’s limited external metrics API.

### Auditor Creation Flow

`CreateAuditorCard.jsx` handles:

- entering a new auditor name
- posting to `/api/auditor/create/`
- showing the private key in a modal
- copy-to-clipboard support
- manual acknowledgment that the key has been stored

This is one of the clearer full-stack flows in the project because it ties UI, backend key generation, and operational handling together.

### Service Layer

Frontend services provide lightweight API wrappers:

- `api.js`: Axios instance with base URL
- `uploadService.js`
- `internalSearchService.js`
- `externalSearchService.js`
- `auditorService.js`

Important detail:

- `api.js` hardcodes the backend base URL to `https://safe-search-e9jp.onrender.com`
- The frontend is not currently driven by `VITE_` environment variables

This makes local/prod switching less flexible and is one of the first maintainability issues visible in the client.

### Frontend Crypto Utilities

`frontend/src/utils/crypto.js` contains:

- PEM parsing
- ArrayBuffer-to-hex conversion
- keyword normalization
- SHA-256 hashing via `crypto.subtle.digest`
- RSA private key import using `pkcs8`
- RSA-PSS signing via `crypto.subtle.sign`

This mirrors backend expectations closely:

- normalized lowercase keywords
- SHA-256 keyword hash
- RSA-PSS signatures

The frontend and backend are therefore cryptographically coupled by implementation details, not by a formal shared SDK.

### Error Handling

`errorHandler.js` normalizes backend error responses into:

- `code`
- `message`

This is minimal but sufficient for current UI logging and alerts.

### Unused or Partially Integrated UI

`StoragePage.jsx` appears to be a static mock/demo view:

- It renders hardcoded encrypted documents and HMAC token examples
- It is not wired into the active dashboard navigation

This suggests the app either previously intended a storage-visualization tab or still has unfinished UI scope.

### Frontend Strengths

- Clear role-based UX separation
- Good alignment between frontend actions and backend crypto model
- Browser-side signing for external searches is a sensible demo choice
- Auditor creation flow is understandable for non-technical reviewers
- Mobile navigation and responsive layouts are present

### Frontend Limitations and Risks

- No real authentication or session model
- Role selection is purely client-side
- Hardcoded API base URL
- `externalSearchService.js` hardcodes `auditor_id: 1` and is inconsistent with the richer live flow in `SearchPage.jsx`
- Some service modules are not the ones actually used by the page components
- UI logs simulate backend steps rather than reporting real server-side progress
- Static `StoragePage` indicates dead or unfinished UI

## End-to-End Data Flow

### Internal Upload Flow

1. User enters a record in the frontend.
2. Frontend sends plaintext JSON to `POST /api/upload/`.
3. Backend encrypts the full document with AES-GCM.
4. Backend generates HMAC search tokens for indexed fields.
5. Backend also generates deterministic external tokens for auditor lookups.
6. Backend stores:
   - one encrypted document
   - several token-index rows linked to that document

### Internal Search Flow

1. User chooses a field and value.
2. Frontend sends search payload to `/api/search/internal/`.
3. Backend generates trapdoor tokens from each field-value pair.
4. Backend finds matching indexed documents.
5. Backend decrypts matched ciphertexts.
6. Frontend renders plaintext JSON results.

### External Auditor Search Flow

1. Internal team creates an auditor and gives the private key to that auditor.
2. Auditor selects their identity in the frontend and pastes private key.
3. Frontend normalizes and hashes the keyword.
4. Frontend signs the hash with RSA-PSS.
5. Backend verifies the signature using stored public key.
6. Backend searches deterministic external tokens.
7. Backend returns encrypted result blobs padded to a fixed size.
8. Backend records an audit log entry.
9. Frontend shows verification metadata, not decrypted content.

## Deployment and Operations

### Backend Deployment

`render.yaml` defines a Render web service:

- service name: `safe-search-backend`
- Docker deployment
- region: `ohio`
- plan: `free`
- environment variables for:
  - `DEBUG`
  - `SECRET_KEY`
  - `MASTER_KEY`
  - database credentials
  - `PYTHON_VERSION`

### Dockerfile

The backend Docker image:

- uses `python:3.11-slim`
- installs `libpq-dev` and `gcc`
- installs Python dependencies
- copies backend source
- runs `collectstatic`
- starts Gunicorn on port `8000`

### Static Asset Handling

WhiteNoise is configured in Django, which is appropriate for serving collected static files in simple deployments.

### Database

The project expects PostgreSQL with SSL required. The current settings indicate a cloud-managed DB rather than local development defaults.

## Quality and Maintainability Assessment

### What Is Solid

- The project has a coherent idea and the code follows that idea reasonably consistently.
- Backend and frontend flows line up well enough to demonstrate the protocol concepts.
- Models, crypto helpers, and APIs are separated into sensible modules.
- External audit logging and metrics are useful touches for a demo focused on compliance/search visibility.

### What Is Fragile

- Security posture depends heavily on UI trust rather than backend access control.
- There is no real user auth, no permission tiers, and no tenant isolation.
- The active key rotation endpoint is permissive.
- Duplicate class definitions and duplicate URL entries indicate code drift.
- API response structure is not fully uniform across endpoints.
- Test coverage is effectively missing.

### What Should Be Improved First

If this project were to move beyond demo status, the highest-priority improvements would be:

1. Add real authentication and authorization for internal/admin operations.
2. Remove committed secrets and sample private keys from the repository.
3. Replace hardcoded frontend API configuration with environment-driven config.
4. Clean up duplicate backend view definitions and route duplication.
5. Add automated tests for crypto helpers, upload indexing, internal search, external signature verification, and auditor lifecycle flows.
6. Clarify the threat model for the external search path and whether ciphertext return is acceptable.

## Sensitive Data Observation

The repository currently contains materials that should be treated as sensitive in a normal engineering environment:

- `backend/.env` includes live-looking secrets and database credentials
- root files such as `HDFC`, `ICICI`, `IDFC`, and `LIC` contain private keys

For a real deployment or shared codebase, these should not live in version control.

## Final Assessment

This project is a full-stack demonstration of encrypted document storage with dual search modes:

- internal trusted search with decryption
- external signed search with encrypted-only responses

Its strongest aspect is conceptual coherence: the backend data model, crypto helpers, API design, and frontend workflows all point toward the same searchable-encryption use case.

Its weakest aspect is operational hardening: authentication, secret handling, testing, and backend security controls are not mature enough for production use.

As a demo or academic prototype, it is clear, functional, and understandable. As a production candidate, it would require substantial security and reliability work before being safe to deploy.
