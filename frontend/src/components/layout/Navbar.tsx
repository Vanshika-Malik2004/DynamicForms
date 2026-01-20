import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { DEFAULT_FORM_ID } from '../../constants/config';

export function Navbar() {
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to={`/forms/${DEFAULT_FORM_ID}`} className="text-xl font-bold text-primary-600">
                            Dynamic Form
                        </Link>

                        <div className="hidden md:flex space-x-4">
                            <Link
                                to={`/forms/${DEFAULT_FORM_ID}`}
                                className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                Apply
                            </Link>

                            {/* Admin Links */}
                            {user.isAdmin && (
                                <>
                                    <Link
                                        to={`/admin/forms/${DEFAULT_FORM_ID}`}
                                        className="text-gray-600 hover:text-primary-600 transition-colors"
                                    >
                                        Manage Fields
                                    </Link>
                                    <Link
                                        to={`/admin/forms/${DEFAULT_FORM_ID}/submissions`}
                                        className="text-gray-600 hover:text-primary-600 transition-colors"
                                    >
                                        View All Submissions
                                    </Link>
                                </>
                            )}

                            {/* Candidate Links */}
                            {!user.isAdmin && (
                                <Link
                                    to="/my-submissions"
                                    className="text-gray-600 hover:text-primary-600 transition-colors"
                                >
                                    My Applications
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    className="h-8 w-8 rounded-full"
                                />
                            )}
                            <span className="text-sm text-gray-700">{user.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-secondary text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
