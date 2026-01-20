// Extra field type from backend
export interface ExtraField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'textarea';
    required: boolean;
    active: boolean;
    order: number;
}

// Form template from backend
export interface FormTemplate {
    id: string;
    title: string;
    permanentFields: ExtraField[];
    extraFields: ExtraField[];
}

// Submission data
export interface SubmissionData {
    staticValues: Record<string, string | number>;
    extraValues: Record<string, string | number>;
}

// Submission response
export interface Submission {
    id: string;
    formId: string;
    userId: string;
    userEmail: string;
    staticValues: Record<string, string | number>;
    extraValues: Record<string, string | number>;
    createdAt: string;
}

// Submissions list response
export interface SubmissionsListResponse {
    formId: string;
    total: number;
    submissions: Submission[];
}

// API error response
export interface ApiError {
    error: string;
    message: string;
    details?: string[];
}

// User type
export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAdmin?: boolean;
}
