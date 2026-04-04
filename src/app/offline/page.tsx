export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <svg
          className="w-16 h-16 mx-auto mb-6 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          أنت غير متصل
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          اتصل بالإنترنت لمتابعة تصفح WSFA.
        </p>
      </div>
    </div>
  );
}
