import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { NotAuthorized } from '../components/form/NotAuthorized';
import { apiFetch } from '../lib/api';
import type { FormTemplate, ExtraField } from '../lib/types';
import { deepEqual } from '../lib/utils';



export function AdminFormBuilder() {
    const { formId } = useParams<{ formId: string }>();
    const queryClient = useQueryClient();
    const [permanentFields, setPermanentFields] = useState<ExtraField[]>([]);
    const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
    // Keep track of the original state for dirty checking
    const [originalExtraFields, setOriginalExtraFields] = useState<ExtraField[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newField, setNewField] = useState<Partial<ExtraField>>({
        label: '',
        type: 'text',
        required: false,
        active: true,
        order: 0,
    });
    const [error, setError] = useState('');
    const [savedMessage, setSavedMessage] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(true);

    // Deep comparison helper for dirty state
    const isDirty = !deepEqual(extraFields, originalExtraFields);

    // Fetch form template
    const { data: formTemplate, isLoading, error: queryError } = useQuery({
        queryKey: ['form', formId],
        queryFn: async () => {
            try {
                return await apiFetch<FormTemplate>(`/forms/${formId}`);
            } catch (err: any) {
                if (err.message.includes('403') || err.message.includes('Forbidden')) {
                    setIsAuthorized(false);
                }
                throw err;
            }
        },
        staleTime: 60000,
        retry: 1, // Don't retry too many times on 404
    });

    // Initialize fields when data loads - only if not already initialized or if data changed significantly
    useEffect(() => {
        if (formTemplate) {
            if (formTemplate.permanentFields) {
                setPermanentFields(formTemplate.permanentFields);
            }
            if (formTemplate.extraFields) {
                setExtraFields(formTemplate.extraFields);
                setOriginalExtraFields(formTemplate.extraFields);
            }
        }
    }, [formTemplate]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: (fields: ExtraField[]) =>
            apiFetch(`/forms/${formId}/fields`, {
                method: 'PUT',
                body: JSON.stringify({ extraFields: fields }),
            }),
        onSuccess: (data: FormTemplate) => {
            queryClient.invalidateQueries({ queryKey: ['form', formId] });
            // Update local state to match server response to reset dirty state
            if (data.extraFields) {
                setExtraFields(data.extraFields);
                setOriginalExtraFields(data.extraFields);
            }
            setError('');
            setSavedMessage('Changes saved successfully!');
            setTimeout(() => setSavedMessage(''), 3000);
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    if (!isAuthorized) {
        return <NotAuthorized />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
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

    const handleAddField = () => {
        if (!newField.label) {
            setError('Field label is required');
            return;
        }

        const field: ExtraField = {
            id: `f${Date.now()}`,
            label: newField.label!,
            type: newField.type || 'text',
            required: newField.required || false,
            active: newField.active !== false,
            order: extraFields.length,
        };

        setExtraFields([...extraFields, field]);
        setNewField({ label: '', type: 'text', required: false, active: true, order: 0 });
        setShowAddModal(false);
    };

    const handleDeleteField = (id: string) => {
        setExtraFields(extraFields.filter(f => f.id !== id));
    };

    const handleToggleActive = (id: string) => {
        setExtraFields(extraFields.map(f =>
            f.id === id ? { ...f, active: !f.active } : f
        ));
    };

    const handleSave = () => {
        saveMutation.mutate(extraFields);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Form Fields</h1>
                            <p className="text-gray-600 mt-1">{formTemplate?.title}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {savedMessage && (
                                <span className="text-green-600 text-sm font-medium animate-fade-in-out">
                                    {savedMessage}
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={!isDirty || saveMutation.isPending}
                                className={`btn-primary ${(!isDirty || saveMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Permanent Fields Section */}
                    {permanentFields.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">🔒</span> Permanent Fields
                                <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Fixed</span>
                            </h3>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {permanentFields.map(field => (
                                            <tr key={field.id || `perm-${field.order}`} className="bg-gray-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                                    {field.label}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {field.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {field.required ? 'Yes' : 'No'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        Locked
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Extra Fields Section */}
                    <div className="mb-4 flex justify-between items-end">
                        <h3 className="text-lg font-semibold text-gray-800">Extra Fields</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            + Add Custom Field
                        </button>
                    </div>

                    {extraFields.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-500">No extra fields added yet.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-2 text-primary-600 hover:text-primary-800 font-medium"
                            >
                                Add your first custom field
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {extraFields.map(field => (
                                        <tr key={field.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {field.label}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {field.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {field.required ? 'Yes' : 'No'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${field.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {field.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleToggleActive(field.id)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    {field.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteField(field.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Field Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Add New Field</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                                <input
                                    type="text"
                                    value={newField.label || ''}
                                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., Last Company"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={newField.type || 'text'}
                                    onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                                    className="input-field"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="textarea">Textarea</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newField.required || false}
                                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">Required field</label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddField}
                                className="btn-primary"
                            >
                                Add Field
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
