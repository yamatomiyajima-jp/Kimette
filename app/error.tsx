"use client";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-lg font-medium text-text-primary mb-2">
          エラーが発生しました
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        <button
          onClick={reset}
          className="bg-text-primary text-white py-2.5 px-6 rounded-md text-sm font-medium"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
