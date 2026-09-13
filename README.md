# 🌍 AA LUXE TRAVELS (https://aaluxe.netlify.app/)

AA Luxe Travels is a high-end, full-featured luxury travel booking and management web platform. It allows users to browse exclusive curated travel destinations, view luxury property listings, manage user favorites, handle shopping carts, and interact with an integrated admin portal backed by Firebase.

---

## ✨ Features

- **Luxury Property & Destination Listings:** Browse exclusive global villas, high-end suites, and curated travel experiences with responsive views.
- **Dynamic Cart & Favorites:** Save dream properties to your favorites or add them directly to your booking cart.
- **Admin Dashboard (`admin.html`):** Management portal for tracking listings, updating inventory, and monitoring bookings.
- **User Authentication (`login.html`, `profile.html`):** Secure login, user sessions, and customized profile management.
- **Firebase Backend Integration:** Real-time data sync, security rules, and serverless functions via Firebase.

---

## 🛠️ Tech Stack

- **Front-End:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Custom responsive design (`style.css`)
- **Backend & Services:** Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **Configuration & Rules:** `firebase.json`, `firestore.rules`, `storage.rules`, `cors.json`

---

## 📂 Project Structure

```text
AALuxe/
├── index.html              # Landing page / Home
├── about.html              # About AA Luxe Travels brand & mission
├── listings.html           # Browse luxury properties & destinations
├── cart.html               # Booking cart management
├── favorites.html          # Saved user favorites/wishlist
├── login.html              # User authentication interface
├── profile.html            # User account settings & dashboard
├── admin.html              # Administrative control center
├── script.js               # Global front-end logic and UI controllers
├── style.css               # Main luxury styling stylesheet
├── src/                    # Source assets and modular components
├── functions/              # Firebase Cloud Functions backend
├── firebase.json           # Firebase hosting & project configuration
├── firestore.rules         # Cloud Firestore security rules
├── firestore.indexes.json  # Firestore database query indexes
├── storage.rules           # Firebase Cloud Storage access rules
└── SECURITY.md             # Security policy and vulnerability reporting
