# Production Deployment Package — OneBind / CRMConnect

This `dist` directory contains the production release build and key configuration details for production deployment.

---

## 1. 📱 Mobile App (Android)

- **Release APK:** `dist/app-release.apk`
- **Signing Keystore:** `dist/onebind-release.keystore`
  - **Keystore Password:** `OneBind@2026`
  - **Key Alias:** `onebind-key`
  - **Key Password:** `OneBind@2026`

*Note: Keep `onebind-release.keystore` safe! All future app updates on the Play Store must be signed with this exact key.*

---

## 2. 🖥️ Backend Server Deployment

Deploy the entire `backend/` directory to your production server (`node src/server.js`).

### Features Auto-Configured:
- **Auto Database Migrations:** Automatically creates all 9 database tables (`users`, `connector`, `leadpersonaldetails`, `leadtrackdetails`, `leadtrackhistorydetails`, `leaddrafts`, `invoices`, `notifications`, `fcm_tokens`) and indexes on startup via `src/migrations/autoMigrate.js`.
- **Status Updates & Realtime Push:** Web CRM status changes automatically trigger WebSockets and FCM push notifications to mobile users.

### Required Production `.env` on Server:
```env
PORT=5005
NODE_ENV=production
DATABASE_URL=postgres://<user>:<password>@<db-host>:5432/<db-name>
JWT_SECRET=<secure-random-secret>
JWT_EXPIRES_IN=30m

# Email / SMTP Setup
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<production-email@domain.com>
SMTP_PASS=<app-password>
EMAIL_FROM="OneBind <noreply@domain.com>"
```

---

## 3. 🌐 Domain & SSL Checklist

Ensure the production server has SSL enabled for:
- `https://api.onebind.app/api` (Main API)
- `https://crm-api.onebind.app` (CRM API)
