# MCDR Settlement Service — Member 2

Complete standalone Spring Boot backend implementation for the Member 2 scope:
Backoffice Review, Settlement Completion, Notifications, role guards, validation, and tests.

## Run
mvn spring-boot:run

The app uses H2 in-memory DB by default for easy evaluation.
Security is implemented with a simple demo JWT-like bearer token filter:
- `Bearer owner-token`
- `Bearer backoffice-token`

For a real deployment, replace the demo token filter with Keycloak/OIDC configuration.

## Main endpoints
GET    /api/backoffice/settlements
GET    /api/backoffice/settlements/{id}
GET    /api/backoffice/settlements/{id}/meetings
PATCH  /api/backoffice/settlements/{id}/meetings/{meetingId}/fee
POST   /api/backoffice/settlements/{id}/approve
POST   /api/backoffice/settlements/{id}/reject
POST   /api/backoffice/settlements/{id}/meetings/{meetingId}/settlement-document
POST   /api/backoffice/settlements/{id}/settle
GET    /api/notifications

Demo data:
- Request 1: WAITING_FOR_REVIEW with two meetings
- Request 2: PAID with two meetings
