export function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="card max-w-md text-center">
                <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <a href="/" className="btn-primary inline-block">
                    Go to Home
                </a>
            </div>
        </div>
    );
}
