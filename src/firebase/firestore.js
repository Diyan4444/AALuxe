/* ═══════════════════════════════════════════════
   AALUXE — Firestore Data Operations Module
   Unified database interactions for properties, locations, types, users, & searchLogs
   ═══════════════════════════════════════════════ */

import { db } from './config.js';
import defaultProperties from '../../properties_temp.js';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, setDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Default taxonomy seed lists (Used strictly during explicit admin seeding)
const DEFAULT_LOCATIONS = ['Lonavala', 'Pawna', 'Karjat', 'Igatpuri', 'Bhandardara', 'Nashik', 'Mahabaleshwar', 'Alibaug', 'Goa'];
const DEFAULT_TYPES = ['Resort', 'Villa'];

// ─── PROPERTIES ─────────────────────────────────────────────────────────────
export const propertiesRef = collection(db, "properties");

/**
 * Listens to properties in Firestore. Returns actual Firestore documents only.
 * Passes (properties, null) on success or (null, error) on failure.
 */
export function subscribeToProperties(callback) {
  return onSnapshot(propertiesRef, (snapshot) => {
    const properties = [];
    snapshot.forEach(d => properties.push({ id: d.id, ...d.data() }));
    callback(properties, null);
  }, (error) => {
    console.error("Error listening to properties from Firestore:", error);
    callback(null, error);
  });
}

export async function createProperty(propertyData) {
  return await addDoc(propertiesRef, {
    ...propertyData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateProperty(id, propertyData) {
  return await updateDoc(doc(db, "properties", id), {
    ...propertyData,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProperty(id) {
  return await deleteDoc(doc(db, "properties", id));
}

/**
 * Bulk seed sample stays from properties_temp.js into Firestore upon EXPLICIT admin action.
 * Never called automatically on page load.
 */
export async function seedPropertiesToFirestore() {
  // 1. Fetch all current property documents in Firestore
  const snap = await getDocs(propertiesRef);

  // 2. Delete all existing documents to wipe extra/duplicate entries
  if (!snap.empty) {
    const batchSize = 400;
    for (let i = 0; i < snap.docs.length; i += batchSize) {
      const chunk = snap.docs.slice(i, i + batchSize);
      const deleteBatch = writeBatch(db);
      chunk.forEach(d => deleteBatch.delete(d.ref));
      await deleteBatch.commit();
    }
  }

  // 3. Re-insert the exact 89 default catalog stays without createdAt timestamp so they display 'Catalog Default'
  const batchSize = 400;
  let count = 0;

  for (let i = 0; i < defaultProperties.length; i += batchSize) {
    const chunk = defaultProperties.slice(i, i + batchSize);
    const seedBatch = writeBatch(db);

    chunk.forEach(prop => {
      const { id, price, rating, ...propData } = prop;
      const newDocRef = doc(propertiesRef);
      // Omit createdAt so formatAddedTime renders 'Catalog Default'
      seedBatch.set(newDocRef, {
        ...propData,
        published: true
      });
      count++;
    });

    await seedBatch.commit();
  }

  // Seed missing taxonomy locations in batch
  const existingLocSnap = await getDocs(locationsRef);
  const existingLocNames = new Set(existingLocSnap.docs.map(d => (d.data().name || '').trim().toLowerCase()));
  const locBatch = writeBatch(db);
  let locCount = 0;
  for (const locName of DEFAULT_LOCATIONS) {
    if (!existingLocNames.has(locName.toLowerCase())) {
      const newLocRef = doc(locationsRef);
      locBatch.set(newLocRef, { name: locName });
      locCount++;
    }
  }
  if (locCount > 0) await locBatch.commit();

  // Seed missing taxonomy stay types in batch
  const existingTypeSnap = await getDocs(typesRef);
  const existingTypeNames = new Set(existingTypeSnap.docs.map(d => (d.data().name || '').trim().toLowerCase()));
  const typeBatch = writeBatch(db);
  let typeCount = 0;
  for (const typeName of DEFAULT_TYPES) {
    if (!existingTypeNames.has(typeName.toLowerCase())) {
      const newTypeRef = doc(typesRef);
      typeBatch.set(newTypeRef, { name: typeName });
      typeCount++;
    }
  }
  if (typeCount > 0) await typeBatch.commit();

  return count;
}

/**
 * Deduplicates properties in Firestore based on property name and location,
 * deleting extra copies and keeping 1 unique record per property.
 */
export async function removeDuplicateProperties() {
  const snap = await getDocs(propertiesRef);
  if (snap.empty) return 0;

  const seen = new Set();
  const duplicates = [];

  snap.docs.forEach(d => {
    const data = d.data();
    const key = `${(data.name || '').trim().toLowerCase()}_${(data.location || '').trim().toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push(d.ref);
    } else {
      seen.add(key);
    }
  });

  if (duplicates.length === 0) return 0;

  const batchSize = 400;
  let removedCount = 0;

  for (let i = 0; i < duplicates.length; i += batchSize) {
    const chunk = duplicates.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach(docRef => {
      batch.delete(docRef);
      removedCount++;
    });
    await batch.commit();
  }

  return removedCount;
}

// ─── TAXONOMY (LOCATIONS & TYPES) ───────────────────────────────────────────
export const locationsRef = collection(db, "locations");
export const typesRef = collection(db, "types");

export function subscribeToLocations(callback) {
  return onSnapshot(locationsRef, (snapshot) => {
    const locations = [];
    snapshot.forEach(d => locations.push({ id: d.id, ...d.data() }));
    callback(locations, null);
  }, (error) => {
    console.error("Error listening to locations from Firestore:", error);
    callback(null, error);
  });
}

export function subscribeToTypes(callback) {
  return onSnapshot(typesRef, (snapshot) => {
    const types = [];
    snapshot.forEach(d => types.push({ id: d.id, ...d.data() }));
    callback(types, null);
  }, (error) => {
    console.error("Error listening to types from Firestore:", error);
    callback(null, error);
  });
}

export async function addLocation(name) {
  return await addDoc(locationsRef, { name, createdAt: serverTimestamp() });
}

export async function deleteLocation(id) {
  return await deleteDoc(doc(db, "locations", id));
}

export async function addType(name) {
  return await addDoc(typesRef, { name, createdAt: serverTimestamp() });
}

export async function deleteType(id) {
  return await deleteDoc(doc(db, "types", id));
}

// ─── USERS & ROLES (ADMIN ONLY) ──────────────────────────────────────────────
export const usersRef = collection(db, "users");

export function subscribeToUsers(callback) {
  return onSnapshot(usersRef, (snapshot) => {
    const users = [];
    snapshot.forEach(d => users.push({ id: d.id, ...d.data() }));
    callback(users, null);
  }, (error) => {
    console.error("Error listening to users from Firestore:", error);
    callback(null, error);
  });
}

export async function updateUserRole(userId, newRole) {
  return await updateDoc(doc(db, "users", userId), {
    role: newRole,
    updatedAt: serverTimestamp()
  });
}

// ─── SEARCH & USER ACTIVITY AUDIT LOGGING ────────────────────────────────────
export const searchLogsRef = collection(db, "searchLogs");

export async function logSearchActivity(searchData = {}) {
  try {
    const cachedUser = (() => {
      try { return JSON.parse(localStorage.getItem('aaluxe_user')); } catch { return null; }
    })();

    const payload = {
      query: searchData.query || '',
      location: searchData.location || '',
      type: searchData.type || '',
      userEmail: searchData.userEmail || cachedUser?.email || 'Guest Visitor',
      userName: searchData.userName || cachedUser?.name || 'Guest Visitor',
      uid: searchData.uid || cachedUser?.uid || 'guest',
      timestamp: serverTimestamp()
    };

    return await addDoc(searchLogsRef, payload);
  } catch (err) {
    console.warn("Could not log search activity:", err);
  }
}

export function subscribeToSearchLogs(callback) {
  return onSnapshot(searchLogsRef, (snapshot) => {
    const logs = [];
    snapshot.forEach(d => logs.push({ id: d.id, ...d.data() }));
    logs.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA;
    });
    callback(logs, null);
  }, (error) => {
    console.error("Error subscribing to search logs from Firestore:", error);
    callback(null, error);
  });
}

export async function clearSearchLogs() {
  try {
    const snap = await getDocs(searchLogsRef);
    if (snap.empty) return 0;

    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.delete(d.ref);
    });
    await batch.commit();
    return snap.size;
  } catch (err) {
    console.error("Error clearing search logs:", err);
    throw err;
  }
}


