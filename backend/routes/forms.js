const express = require('express');
const { db, admin } = require('../firebaseAdmin');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { createFormSchema, updateExtraFieldsSchema } = require('../validation/schemas');

const router = express.Router();

// GET /forms/:formId

router.get('/:formId', authenticate, async (req, res) => {
    try {
        const { formId } = req.params;

        const formDoc = await db.collection('forms').doc(formId).get();

        if (!formDoc.exists) {
            return res.json({
                id: formId,
                title: 'Candidate Application Form',
                permanentFields: [],
                extraFields: []
            });
        }

        const formData = formDoc.data();

        res.json({
            id: formDoc.id,
            title: formData.title,
            permanentFields: formData.permanentFields || [],
            extraFields: formData.extraFields || []
        });
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch form'
        });
    }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const validationResult = createFormSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid request data',
                details: validationResult.error.errors
            });
        }

        const { title, id } = validationResult.data;

        const formRef = id ? db.collection('forms').doc(id) : db.collection('forms').doc();
        const formData = {
            title,
            extraFields: [],
            createdBy: req.user.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await formRef.set(formData);

        res.status(201).json({
            id: formRef.id,
            title: formData.title,
            extraFields: formData.extraFields,
            createdBy: formData.createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create form'
        });
    }
});


// Update extra fields for a form (admin only)

router.put('/:formId/fields', authenticate, requireAdmin, async (req, res) => {
    try {
        const { formId } = req.params;

        // Validate request body
        const validationResult = updateExtraFieldsSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid extra fields data',
                details: validationResult.error.errors
            });
        }

        const { extraFields } = validationResult.data;

        const formRef = db.collection('forms').doc(formId);
        const formDoc = await formRef.get();

        if (!formDoc.exists) {
            await formRef.set({
                title: 'Candidate Application Form',
                extraFields,
                createdBy: req.user.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await formRef.update({
                extraFields,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        const updatedDoc = await formRef.get();
        const updatedData = updatedDoc.data();

        res.json({
            id: formId,
            title: updatedData.title,
            extraFields: updatedData.extraFields,
            updatedAt: updatedData.updatedAt
        });
    } catch (error) {
        console.error('Error updating extra fields:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update extra fields'
        });
    }
});

module.exports = router;
