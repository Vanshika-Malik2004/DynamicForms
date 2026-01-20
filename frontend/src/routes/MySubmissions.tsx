import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { apiFetch } from '../lib/api';
import type { SubmissionsListResponse } from '../lib/types';

export function MySubmissions() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['my-submissions'],
        queryFn: () => apiFetch<SubmissionsListResponse>(`/my-submissions`),
    });

    const deleteMutation = useMutation({
        mutationFn: (submissionId: string) =>
            apiFetch(`/submissions/${submissionId}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
        },
    });

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete submission:', error);
                alert('Failed to delete submission. Please try again.');
            }
        }
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="card">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                        <p className="text-gray-600 mt-1">History of your submitted forms</p>
                    </div>

                    {!data?.submissions || data.submissions.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-500">You haven't submitted any applications yet.</p>
                            <a href="/" className="mt-4 inline-block btn-primary">
                                Apply Now
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.submissions.map(submission => (
                                <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Application #{submission.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Submitted on {new Date(submission.createdAt).toLocaleDateString()} at {new Date(submission.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                Submitted
                                            </span>
                                            <button
                                                onClick={() => handleDelete(submission.id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium hover:underline"
                                                disabled={deleteMutation.isPending}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Name:</span>
                                            <span className="ml-2 font-medium">{submission.staticValues.candidateName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Email:</span>
                                            <span className="ml-2 font-medium">{submission.staticValues.candidateEmail}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
