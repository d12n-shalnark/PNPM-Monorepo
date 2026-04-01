import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-8">
          There was an error during authentication. This could happen if:
        </p>
        
        <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            The authentication link has expired
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            The link has already been used
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            There was a server configuration issue
          </li>
        </ul>
        
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}
