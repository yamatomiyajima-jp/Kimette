export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center">
        <div className="text-2xl mb-3 animate-pulse">⏳</div>
        <p className="text-sm text-text-secondary">読み込み中...</p>
      </div>
    </div>
  );
}
