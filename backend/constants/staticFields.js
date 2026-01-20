
// Static fields configuration for candidate application form 
const STATIC_FIELDS = {
    candidateName: { required: true, type: 'string' },
    candidateEmail: { required: true, type: 'string' },
    candidatePhone: { required: true, type: 'string' },
    primarySkillSet: { required: true, type: 'string' },
    secondarySkillSet: { required: false, type: 'string' },
    candidateLocation: { required: true, type: 'string' },
    preferredJobLocation: { required: true, type: 'string' },
    secondaryPreferredJobLocation: { required: false, type: 'string' },
    experience: { required: true, type: 'number' },
    coreExperience: { required: false, type: 'string' },
    expectation: { required: false, type: 'number' }
};

const STATIC_FIELD_KEYS = Object.keys(STATIC_FIELDS);

const REQUIRED_STATIC_FIELDS = Object.entries(STATIC_FIELDS)
    .filter(([_, config]) => config.required)
    .map(([key, _]) => key);

module.exports = {
    STATIC_FIELDS,
    STATIC_FIELD_KEYS,
    REQUIRED_STATIC_FIELDS
};
