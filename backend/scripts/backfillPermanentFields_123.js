require('dotenv').config();
const { db } = require('../firebaseAdmin');
const { STATIC_FIELDS } = require('../constants/staticFields');

const FORM_ID = '123';

// Optional: nice labels (edit if you want)
const LABELS = {
    candidateName: 'Candidate Name',
    candidateEmail: 'Candidate Email',
    candidatePhone: 'Candidate Phone',
    primarySkillSet: 'Primary Skill Set',
    secondarySkillSet: 'Secondary Skills',
    candidateLocation: 'Candidate Location',
    preferredJobLocation: 'Preferred Job Location',
    secondaryPreferredJobLocation: 'Secondary Preferred Job Location',
    experience: 'Total Experience (Years)',
    coreExperience: 'Core Experience Details',
    expectation: 'Salary Expectation (Annual)'
};

(async () => {
    try {
        const formRef = db.collection('forms').doc(FORM_ID);
        const doc = await formRef.get();

        if (!doc.exists) {
            console.error(`❌ Form with ID '${FORM_ID}' does not exist in Firestore.`);
            process.exit(1);
        }

        const permanentFields = Object.entries(STATIC_FIELDS).map(([key, cfg], idx) => ({
            key,
            label: LABELS[key] || key,
            type: cfg.type === 'number' ? 'number' : (key === 'coreExperience' ? 'textarea' : 'text'),
            required: !!cfg.required,
            locked: true,
            order: idx
        }));

        await formRef.update({
            permanentFields
        });

        console.log(`✅ Added permanentFields to form '${FORM_ID}' successfully.`);
        process.exit(0);
    } catch (e) {
        console.error('❌ Backfill failed:', e);
        process.exit(1);
    }
})();
