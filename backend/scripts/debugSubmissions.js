require('dotenv').config();
const { db } = require('../firebaseAdmin');

const FORM_ID = '123';

(async () => {
    try {
        console.log(`🔍 Checking submissions for form '${FORM_ID}'...`);
        const simpleQuery = await db.collection('submissions').where('formId', '==', FORM_ID).get();
        console.log(`📊 Total (Unsorted) found: ${simpleQuery.size}`);

        if (simpleQuery.size > 0) {
            console.log('📝 Sample Doc ID:', simpleQuery.docs[0].id);
            console.log('📝 Sample Data:', JSON.stringify(simpleQuery.docs[0].data(), null, 2));
        }
        console.log('\n🚀 Testing Query WITH OrderBy (desc)...');
        try {
            const orderedQuery = await db.collection('submissions')
                .where('formId', '==', FORM_ID)
                .orderBy('createdAt', 'desc')
                .get();
            console.log(`Ordered Query Success! Found: ${orderedQuery.size}`);
        } catch (e) {
            console.error('Ordered Query FAILED!');
            console.error('Reason:', e.message);
            if (e.message.includes('requires an index')) {
                console.log(' DIAGNOSIS: Missing Firestore Index');
                console.log(' You need to create a composite index in Firebase Console:');
                console.log('Collection: submissions');
                console.log('Fields: formId (Ascending) + createdAt (Descending)');
            }
        }

        process.exit(0);

    } catch (e) {
        console.error('Script failed:', e);
        process.exit(1);
    }
})();
