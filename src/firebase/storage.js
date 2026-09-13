import { storage, auth } from './config.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/**
 * Upload a property image file to Firebase Storage (Admin controlled)
 * Storage Path: properties/{timestamp}_{filename}
 */
export async function uploadPropertyImage(file, onProgress = null) {
  return uploadImage(file, 'properties', onProgress);
}

/**
 * Upload an image file to Firebase Storage with path structuring and validation
 * @param {File} file - The file object to upload
 * @param {string} folderPath - Target directory e.g., 'properties'
 * @param {Function} onProgress - Optional progress callback (0..100)
 * @returns {Promise<string>} Download URL of the uploaded image
 */
export async function uploadImage(file, folderPath = 'properties', onProgress = null) {
  if (!file) {
    throw new Error("No file selected for upload.");
  }

  // Validate File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
  }

  // Validate Mime Type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type (${file.type}). Allowed formats: JPG, PNG, WEBP, GIF, AVIF.`);
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${folderPath}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (typeof onProgress === 'function') {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error("Storage upload failure:", error);
        reject(new Error("Failed to upload image to Cloud Storage. " + error.message));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

