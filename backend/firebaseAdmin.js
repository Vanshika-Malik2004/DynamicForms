const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

//firebase setup
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set');
}

const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

let serviceAccount;
try {
    serviceAccount = require(resolvedPath);
} catch (error) {
    throw new Error(
        `Failed to load service account key from ${resolvedPath}. ` +
        `Please ensure the file exists and the path in .env is correct.`
    );
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const auth = admin.auth();

console.log('✅ Firebase Admin SDK initialized successfully');

module.exports = {
    admin,
    db,
    auth
};
