# AALUXE Luxury Stays — Security Audit & Architecture Report

## 1. Business & Architectural Model
- **WhatsApp Concierge Inquiries & Bookings**: All property inquiries, date selections, and reservation requests route directly to WhatsApp (`https://wa.me/919819893157`) where a concierge team manages availability.
- **No On-Site Credit Card Transactions**: Online credit card payment forms and gateways have been removed to simplify operations and eliminate PCI compliance risks.
- **Two-Tier System (Admin & Customer)**: Unnecessary provider, staff, service, and appointment scheduling code has been completely removed. The site is managed exclusively by authorized site administrators (`aaluxe0509@gmail.com`, `dailykarma1910@gmail.com`).

---

## 2. Security Architecture & Remediation

- **Centralized Firebase Modular Architecture**: Centralized Firebase configuration under `/src/firebase/` (`config.js`, `auth.js`, `firestore.js`, `storage.js`).
- **Server-Enforced Authorization & Role Escalation Protection**:
  - All operations check server-trusted roles stored in `users/{uid}` or Firebase Auth Custom Claims (`admin`, `customer`).
  - Users CANNOT escalate their own role from `customer` to `admin`.
- **Input Sanitization & XSS Prevention**: All user and catalog strings pass through `escapeHTML()` prior to DOM rendering (`src/utils/security.js`).
- **Cloud Storage Hardening**: Admin property image uploads (`properties/{imageId}`) require `isAdmin()`, max file size `< 5MB`, and strict image MIME type validation (`image/(jpeg|jpg|png|webp|avif).*`).
- **Real-Time Audit Logging**: User search activity is logged securely under `searchLogs`, readable/deletable strictly by `isAdmin()`.

---

## 3. Collection Access Permissions

| Collection | Public Read | Auth Required | Restricted Roles / Ownership |
| :--- | :--- | :--- | :--- |
| `properties/{id}` | YES | WRITE | Admin Only (`isAdmin()`) |
| `locations/{id}` | YES | WRITE | Admin Only (`isAdmin()`) |
| `types/{id}` | YES | WRITE | Admin Only (`isAdmin()`) |
| `users/{uid}` | NO | READ / WRITE | User can access own document; Admin can manage all. |
| `searchLogs/{id}` | NO (CREATE ONLY) | READ / DELETE | Create allowed for all; Read & Delete Admin Only. |

---

## 4. Pre-Production Deployment Checklist
- [x] Streamline auth to Google OAuth with Custom Claims support.
- [x] Enforce Firestore Security Rules (`firestore.rules`).
- [x] Enforce Storage Security Rules (`storage.rules`).
- [x] Remove unused provider, booking, and appointment slot engines.
- [x] Sanitize DOM rendering against XSS.
- [ ] Deploy rules via Firebase CLI before going live: `firebase deploy`.
