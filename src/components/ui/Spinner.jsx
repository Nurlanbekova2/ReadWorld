export default function Spinner({ fullScreen = false, size = "md" }) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizes[size]}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
}
