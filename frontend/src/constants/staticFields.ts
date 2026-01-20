export interface StaticField {
    key: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea';
    required: boolean;
    placeholder?: string;
}

export const STATIC_FIELDS: StaticField[] = [
    {
        key: 'candidateName',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'John Doe'
    },
    {
        key: 'candidateEmail',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'john@example.com'
    },
    {
        key: 'candidatePhone',
        label: 'Phone Number',
        type: 'text',
        required: true,
        placeholder: '+1234567890'
    },
    {
        key: 'primarySkillSet',
        label: 'Primary Skills',
        type: 'text',
        required: true,
        placeholder: 'JavaScript, React, Node.js'
    },
    {
        key: 'secondarySkillSet',
        label: 'Secondary Skills',
        type: 'text',
        required: false,
        placeholder: 'Python, Docker (optional)'
    },
    {
        key: 'candidateLocation',
        label: 'Current Location',
        type: 'text',
        required: true,
        placeholder: 'Mumbai, India'
    },
    {
        key: 'preferredJobLocation',
        label: 'Preferred Job Location',
        type: 'text',
        required: true,
        placeholder: 'Remote / Bangalore'
    },
    {
        key: 'secondaryPreferredJobLocation',
        label: 'Secondary Preferred Location',
        type: 'text',
        required: false,
        placeholder: 'Pune (optional)'
    },
    {
        key: 'experience',
        label: 'Years of Experience',
        type: 'number',
        required: true,
        placeholder: '5'
    },
    {
        key: 'coreExperience',
        label: 'Core Experience Details',
        type: 'textarea',
        required: false,
        placeholder: 'Describe your core experience (optional)'
    },
    {
        key: 'expectation',
        label: 'Salary Expectation (Annual)',
        type: 'number',
        required: false,
        placeholder: '2000000 (optional)'
    }
];
