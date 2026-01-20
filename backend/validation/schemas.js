const { z } = require('zod');
const { STATIC_FIELDS, STATIC_FIELD_KEYS } = require('../constants/staticFields');

// Zod validation schemas for request validation


const extraFieldSchema = z.object({
    id: z.string().min(1, 'Field ID is required'),
    label: z.string().trim().min(1, 'Field label is required'),
    type: z.enum(['text', 'number', 'textarea'], {
        errorMap: () => ({ message: 'Type must be text, number, or textarea' })
    }),
    required: z.boolean().default(false),
    active: z.boolean().default(true),
    order: z.number()
        .int({ message: 'Order must be an integer' })
        .nonnegative({ message: 'Order must be a non-negative integer' })
        .default(0)
});

// Schema for creating a new form
const createFormSchema = z.object({
    id: z.string().optional(),
    title: z.string().trim().min(1, 'Title is required').default('Candidate Application Form')
});

// Schema for updating extra fields
const updateExtraFieldsSchema = z.object({
    extraFields: z.array(extraFieldSchema).refine(
        (fields) => {
            const ids = fields.map(f => f.id);
            return ids.length === new Set(ids).size;
        },
        { message: 'Extra field IDs must be unique' }
    )
});

// Validate static values against static fields definition
const validateStaticValues = (staticValues) => {
    const errors = [];
    const sanitized = {};

    for (const [key, config] of Object.entries(STATIC_FIELDS)) {
        const value = staticValues[key];
        if (config.required) {
            if (value === undefined || value === null || value === '') {
                errors.push(`${key} is required`);
                continue;
            }
        }

        if (value === undefined || value === null || value === '') {
            continue;
        }

        // Type validation and coercion
        if (config.type === 'number') {
            const num = typeof value === 'number' ? value : Number(value);
            if (Number.isNaN(num)) {
                errors.push(`${key} must be a valid number`);
            } else {
                sanitized[key] = num;
            }
        } else if (config.type === 'string') {
            if (typeof value !== 'string') {
                errors.push(`${key} must be a string`);
            } else {
                sanitized[key] = value.trim();
            }
        }
    }

    return { errors, sanitized };
};

// Validate extra values against active extra fields
// Returns { errors: [], sanitized: {} }
const validateExtraValues = (extraValues, activeExtraFields) => {
    const errors = [];
    const sanitized = {};
    const activeFieldIds = activeExtraFields.map(f => f.id);

    for (const field of activeExtraFields) {
        const value = extraValues[field.id];
        if (field.required) {
            if (value === undefined || value === null || value === '') {
                errors.push(`${field.label} is required`);
                continue;
            }
        }

        if (value === undefined || value === null || value === '') {
            continue;
        }

        if (field.type === 'number') {
            const num = typeof value === 'number' ? value : Number(value);
            if (Number.isNaN(num)) {
                errors.push(`${field.label} must be a valid number`);
            } else {
                sanitized[field.id] = num;
            }
        } else {
            if (typeof value !== 'string') {
                errors.push(`${field.label} must be a string`);
            } else {
                sanitized[field.id] = value.trim();
            }
        }
    }

    return { errors, sanitized };
};

module.exports = {
    extraFieldSchema,
    createFormSchema,
    updateExtraFieldsSchema,
    validateStaticValues,
    validateExtraValues
};
