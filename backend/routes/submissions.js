const express = require('express');
const { db, admin } = require('../firebaseAdmin');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateStaticValues, validateExtraValues } = require('../validation/schemas');

const router = express.Router();


// Submit a candidate application (authenticated users)

router.post('/forms/:formId/submissions', authenticate, async (req, res) => {
    try {
        const { formId } = req.params;
        const { staticValues, extraValues } = req.body;
        if (!staticValues || typeof staticValues !== 'object') {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'staticValues is required and must be an object'
            });
        }

        if (extraValues && typeof extraValues !== 'object') {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'extraValues must be an object'
            });
        }
        const formDoc = await db.collection('forms').doc(formId).get();

        if (!formDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Form with ID '${formId}' does not exist`
            });
        }

        const formData = formDoc.data();
        const activeExtraFields = (formData.extraFields || []).filter(f => f.active !== false);
        if (staticValues && typeof staticValues === 'object') {
            staticValues.candidateEmail = req.user.email;
        }
        const staticResult = validateStaticValues(staticValues);
        if (staticResult.errors.length > 0) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Static values validation failed',
                details: staticResult.errors
            });
        }

        const extraResult = validateExtraValues(extraValues || {}, activeExtraFields);
        if (extraResult.errors.length > 0) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Extra values validation failed',
                details: extraResult.errors
            });
        }
        const submissionRef = db.collection('submissions').doc();
        const submissionData = {
            formId,
            userId: req.user.uid,
            userEmail: req.user.email,
            staticValues: staticResult.sanitized,
            extraValues: extraResult.sanitized,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await submissionRef.set(submissionData);

        res.status(201).json({
            id: submissionRef.id,
            message: 'Submission created successfully',
            formId: submissionData.formId,
            userId: submissionData.userId,
            userEmail: submissionData.userEmail,
            staticValues: submissionData.staticValues,
            extraValues: submissionData.extraValues,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create submission'
        });
    }
});

// List all submissions for a form (admin only)

router.get('/admin/forms/:formId/submissions', authenticate, requireAdmin, async (req, res) => {
    try {
        const { formId } = req.params;
        const formDoc = await db.collection('forms').doc(formId).get();
        if (!formDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Form with ID '${formId}' does not exist`
            });
        }
        let submissionsSnapshot;
        try {
            submissionsSnapshot = await db
                .collection('submissions')
                .where('formId', '==', formId)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (error) {
            if (error.code === 9 || error.message.includes('requires an index')) {
                console.warn('⚠️ Missing Firestore Index for formId + createdAt. Falling back to in-memory sorting.');
                submissionsSnapshot = await db
                    .collection('submissions')
                    .where('formId', '==', formId)
                    .get();
            } else {
                throw error;
            }
        }

        const submissions = [];
        submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            submissions.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });
        });
        submissions.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA; // Descending
        });

        res.json({
            formId,
            total: submissions.length,
            submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch submissions'
        });
    }
});

// Get a single submission detail (admin only)

router.get('/admin/submissions/:submissionId', authenticate, requireAdmin, async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submissionDoc = await db.collection('submissions').doc(submissionId).get();

        if (!submissionDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Submission with ID '${submissionId}' does not exist`
            });
        }

        const data = submissionDoc.data();
        res.json({
            id: submissionDoc.id,
            ...data,
            createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch submission'
        });
    }
});


// Get current user's submissions
router.get('/my-submissions', authenticate, async (req, res) => {
    try {
        const userId = req.user.uid;
        let submissionsSnapshot;
        try {
            submissionsSnapshot = await db
                .collection('submissions')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (error) {
            if (error.code === 9 || error.message.includes('requires an index')) {
                submissionsSnapshot = await db
                    .collection('submissions')
                    .where('userId', '==', userId)
                    .get();
            } else {
                throw error;
            }
        }

        const submissions = [];
        submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            submissions.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            });
        });

        // Manual sort for fallback
        submissions.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
        });

        res.json({
            total: submissions.length,
            submissions
        });
    } catch (error) {
        console.error('Error fetching my submissions:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch your submissions'
        });
    }
});

// Delete a submission (Admin or Owner only)

router.delete('/submissions/:submissionId', authenticate, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.uid;

        const submissionRef = db.collection('submissions').doc(submissionId);
        const doc = await submissionRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Submission not found'
            });
        }

        const submissionData = doc.data();
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
        const isAdmin = req.user.email && adminEmails.includes(req.user.email.toLowerCase());

        if (submissionData.userId !== userId && !isAdmin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You act not authorized to delete this submission'
            });
        }

        await submissionRef.delete();

        res.json({
            message: 'Submission deleted successfully',
            id: submissionId
        });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete submission'
        });
    }
});

module.exports = router;
