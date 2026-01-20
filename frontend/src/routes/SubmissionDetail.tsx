import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { NotAuthorized } from '../components/form/NotAuthorized';
import { apiFetch } from '../lib/api';
import { STATIC_FIELDS } from '../constants/staticFields';
import type { Submission } from '../lib/types';

export function SubmissionDetail() {
    const { submissionId } = useParams<{ submissionId: string }>();
    const [isAuthorized, setIsAuthorized] = useState(true);

    const { data: submission, isLoading } = useQuery({
        queryKey: ['submission', submissionId],
        queryFn: async () => {
            try {
                return await apiFetch<Submission>(`/admin/submissions/${submissionId}`);
            } catch (err: any) {
                if (err.message.includes('403') || err.message.includes('Forbidden')) {
                    setIsAuthorized(false);
                }
                throw err;
            }
        },
    });

    if (!isAuthorized) {
        return <NotAuthorized />;
    }

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

    if (!submission) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="card text-center">
                        <p className="text-gray-500">Submission not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="card">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
                        <p className="text-gray-600 mt-1">
                            Submitted on {new Date(submission.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Submission ID:</span>
                                <span className="ml-2 text-gray-900 font-mono">{submission.id}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">User Email:</span>
                                <span className="ml-2 text-gray-900">{submission.userEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Static Fields */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {STATIC_FIELDS.map(field => {
                                const value = submission.staticValues[field.key];
                                if (value === undefined || value === null || value === '') return null;

                                return (
                                    <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                        </label>
                                        <p className="text-gray-900">
                                            {field.type === 'textarea' ? (
                                                <span className="whitespace-pre-wrap">{value}</span>
                                            ) : (
                                                value
                                            )}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Extra Fields */}
                    {Object.keys(submission.extraValues).length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(submission.extraValues).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {key}
                                        </label>
                                        <p className="text-gray-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <a href={`/admin/forms/${submission.formId}/submissions`} className="btn-secondary">
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
