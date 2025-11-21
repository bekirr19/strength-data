// Loading Spinner Component
export default function LoadingSpinner({ fullScreen = false, message = "Yükleniyor..." }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-300 text-sm md:text-base">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-gray-400 text-sm">{message}</p>
    </div>
  );
}
