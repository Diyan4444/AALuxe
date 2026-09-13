const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Callable Cloud Function: setUserRole
 * Grants or updates Custom User Claims (admin, customer) server-side.
 * Only callers with verified admin Custom Claims or initial admin credentials can invoke this.
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // 1. Verify caller authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerEmail = context.auth.token.email || '';
  const callerIsAdmin = context.auth.token.admin === true || 
    ['aaluxe0509@gmail.com', 'dailykarma1910@gmail.com'].includes(callerEmail.toLowerCase());

  if (!callerIsAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Administrative privileges required.');
  }

  const { targetUid, newRole } = data;
  if (!targetUid || !newRole) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid and newRole parameters are required.');
  }

  // 2. Map claims
  const claims = {
    admin: newRole === 'admin',
    customer: newRole !== 'admin'
  };

  try {
    // 3. Set Custom User Claims via Firebase Admin SDK
    await admin.auth().setCustomUserClaims(targetUid, claims);

    // 4. Update Firestore user profile document
    await admin.firestore().collection('users').doc(targetUid).set({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { status: 'success', targetUid, newRole, claims };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
