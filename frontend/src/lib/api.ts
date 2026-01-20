import { auth } from './firebase';
import { API_BASE } from '../constants/config';

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

// API fetch wrapper with automatic token injection

export async function apiFetch<T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // Add Firebase ID token if authentication is required
    if (requireAuth) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Not authenticated');
        }

        const token = await user.getIdToken();
        headers = {
            ...headers,
            Authorization: `Bearer ${token}`,
        };
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    // Handle 401 - redirect to login
    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized - redirecting to login');
    }

    // Handle errors
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: 'Error',
            message: response.statusText,
        }));
        throw new Error(error.message || 'An error occurred');
    }

    return response.json();
}
