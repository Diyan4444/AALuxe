# AALUXE — Luxury Stays Platform

<p align="center">
  <img src="logo.png" alt="AALUXE Logo" width="180">
</p>

<p align="center">
  <strong>Luxury stays at unbeatable prices.</strong>
</p>

<p align="center">
  <strong>Live website at: https://aaluxe.netlify.app/</strong>
</p>

<p align="center">
  A premium accommodation discovery interface focused on curated stays, destinations, personalized collections, and streamlined property management.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  <img src="https://img.shields.io/badge/Google%20Identity-4285F4?style=for-the-badge&logo=google&logoColor=white">
  <img src="https://img.shields.io/badge/Responsive-Design-111111?style=for-the-badge">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Project Objectives](#project-objectives)
- [Core Features](#core-features)
- [Application Structure](#application-structure)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Pages](#pages)
- [Property Management](#property-management)
- [Authentication](#authentication)
- [Data Management](#data-management)
- [Local Storage](#local-storage)
- [UI and UX](#ui-and-ux)
- [Responsive Design](#responsive-design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Firebase Configuration](#firebase-configuration)
- [Google Sign-In Configuration](#google-sign-in-configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Current Scope](#current-scope)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

# Overview

**AALUXE** is a luxury accommodation discovery web application designed to provide users with a premium interface for exploring curated hotels, resorts, villas, boutiques, and other accommodation properties.

The project combines a sophisticated luxury-oriented visual system with dynamic property discovery, filtering, favorites, cart functionality, Google-based authentication, and a Firebase Firestore-backed administrative property directory.

The interface is designed around a high-end hospitality aesthetic using:

- Ivory backgrounds
- Deep charcoal surfaces
- Antique-gold accents
- Editorial typography
- Large photographic imagery
- Responsive layouts
- Parallax interactions
- Animated content sections
- Modal-based property details

AALUXE is currently implemented primarily as a **client-side web application**, with Firebase Firestore providing the dynamic property, location, and property-type data used by the application.

---

# Project Objectives

The primary objectives of AALUXE are to:

1. Provide a premium accommodation discovery experience.
2. Present properties using a visually focused, editorial-style interface.
3. Allow users to browse and filter available stays.
4. Allow users to save properties to a personal favorites collection.
5. Allow users to maintain a temporary selection/cart.
6. Provide Google-based user authentication.
7. Provide an administrative interface for managing property listings.
8. Synchronize property information dynamically through Firebase Firestore.
9. Maintain responsive usability across desktop and mobile devices.
10. Establish a scalable foundation for future booking and payment functionality.

---

# Core Features

## User Features

### Property Discovery

Users can browse accommodation listings containing information such as:

- Property name
- Property type
- Location
- Price
- Rating
- Description
- Amenities
- Promotional highlights
- Availability indicators
- Property imagery

---

### Search and Filtering

The listings interface supports property discovery through:

- Keyword search
- Location filtering
- Property-type filtering
- URL-based search parameters
- Dynamic location taxonomy
- Dynamic property-type taxonomy

Property and taxonomy data are synchronized from Firebase Firestore.

---

### Property Details

Properties can be opened through a dynamic detail interface displaying additional information without requiring a separate property page.

The interface uses a modal overlay to present:

- Property imagery
- Property name
- Type
- Location
- Price
- Description
- Amenities
- Rating
- Additional property information

---

### Favorites

Users can save properties for later reference.

Favorites are stored locally using browser `localStorage`.

The navigation interface dynamically displays the number of saved properties.

---

### Cart

Users can add properties to a temporary cart.

The cart stores relevant property information including:

- Property ID
- Name
- Type
- Location
- Price
- Image

The cart count is dynamically displayed throughout the interface.

---

### Toast Notifications

The application provides lightweight visual notifications for user actions such as:

- Adding a property
- Removing a favorite
- Attempting to add an already selected property
- Other interface interactions

---

# Authentication

AALUXE uses **Google Identity Services** for user sign-in.

The authentication flow is implemented on the client side:

```text
User
  │
  ▼
Login Page
  │
  ▼
Google Sign-In
  │
  ▼
Google Credential
  │
  ▼
Credential Payload Processing
  │
  ▼
User Profile Stored Locally
  │
  ▼
AALUXE Application
