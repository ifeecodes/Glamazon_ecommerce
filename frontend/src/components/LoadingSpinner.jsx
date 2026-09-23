const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="relative">
        <div className="w-20 h-20 border-blue-100 border-2 rounded-full" />
        <div className="w-20 h-20 animate-spin rounded-full absolute left-0 top-0 border-t-2 border-blue-600" />
        <div className="sr-only">Loading</div>
      </div>
    </div>
  );
};
export default LoadingSpinner;
