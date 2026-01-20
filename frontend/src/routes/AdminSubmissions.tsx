import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { NotAuthorized } from '../components/form/NotAuthorized';
import { apiFetch } from '../lib/api';
import type { SubmissionsListResponse } from '../lib/types';
import { useState } from 'react';

export function AdminSubmissions() {
    const { formId } = useParams<{ formId: string }>();
    const [isAuthorized, setIsAuthorized] = useState(true);

    const { data, isLoading } = useQuery({
        queryKey: ['submissions', formId],
        queryFn: async () => {
            try {
                return await apiFetch<SubmissionsListResponse>(`/admin/forms/${formId}/submissions`);
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
                <div className="max-w-7xl mx-auto px-4 py-8">
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="card">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
                        <p className="text-gray-600 mt-1">Total: {data?.total || 0} applications</p>
                    </div>

                    {!data?.submissions || data.submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No submissions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.submissions.map(submission => (
                                        <tr key={submission.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {submission.staticValues.candidateName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.staticValues.candidateEmail}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {submission.staticValues.experience} years
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(submission.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <a
                                                    href={`/admin/submissions/${submission.id}`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    View Details
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
