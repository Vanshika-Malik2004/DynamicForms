import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { FieldInput } from '../components/form/FieldInput';
import { FormErrorBanner } from '../components/form/FormErrorBanner';
import { apiFetch } from '../lib/api';
import { STATIC_FIELDS } from '../constants/staticFields';
import { useAuth } from '../hooks/useAuth';
import type { FormTemplate, SubmissionData } from '../lib/types';

export function CandidateForm() {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [staticValues, setStaticValues] = useState<Record<string, string | number>>({});
    const [extraValues, setExtraValues] = useState<Record<string, string | number>>({});
    const [formError, setFormError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);

    // Initialize email in static values when user loads
    useEffect(() => {
        if (user?.email) {
            setStaticValues(prev => ({ ...prev, candidateEmail: user.email! }));
        }
    }, [user]);

    // Fetch form template
    const { data: formTemplate, isLoading: formLoading } = useQuery({
        queryKey: ['form', formId],
        queryFn: () => apiFetch<FormTemplate>(`/forms/${formId}`),
        staleTime: 60000, // 1 minute
        enabled: !!user, // Only fetch if user is logged in
    });

    const isLoading = authLoading || formLoading;

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: (data: SubmissionData) =>
            apiFetch(`/forms/${formId}/submissions`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            setShowSuccess(true);
            // Reset form but keep email
            setStaticValues({ candidateEmail: user?.email || '' });
            setExtraValues({});
            setFormError('');
            setTimeout(() => setShowSuccess(false), 5000);
        },
        onError: (error: Error) => {
            setFormError(error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Ensure email is set to auth user's email
        const finalStaticValues = {
            ...staticValues,
            candidateEmail: user?.email || ''
        };

        submitMutation.mutate({ staticValues: finalStaticValues, extraValues });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="card">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const activeExtraFields = (formTemplate?.extraFields || [])
        .filter(f => f.active)
        .sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="card">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {formTemplate?.title || 'Application Form'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Please fill out all required fields marked with *
                    </p>

                    {showSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-green-700">Application submitted successfully!</p>
                            </div>
                        </div>
                    )}

                    {formError && <FormErrorBanner message={formError} onDismiss={() => setFormError('')} />}

                    <form onSubmit={handleSubmit}>
                        {/* Static Fields */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {STATIC_FIELDS.map(field => {
                                    const isEmail = field.key === 'candidateEmail';
                                    return (
                                        <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                            <FieldInput
                                                label={field.label}
                                                type={field.type}
                                                value={isEmail ? (user?.email || '') : (staticValues[field.key] || '')}
                                                onChange={(value) => {
                                                    // Prevent changing email
                                                    if (!isEmail) {
                                                        setStaticValues(prev => ({ ...prev, [field.key]: value }));
                                                    }
                                                }}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                disabled={isEmail}
                                                helpText={isEmail ? "This email is linked to your login and cannot be changed." : undefined}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Extra Fields */}
                        {activeExtraFields.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeExtraFields.map(field => (
                                        <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                            <FieldInput
                                                label={field.label}
                                                type={field.type}
                                                value={extraValues[field.id] || ''}
                                                onChange={(value) => setExtraValues(prev => ({ ...prev, [field.id]: value }))}
                                                required={field.required}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitMutation.isPending}
                                className="btn-primary"
                            >
                                {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
