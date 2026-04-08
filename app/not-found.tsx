import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-lg font-medium text-text-primary mb-2">
          ページが見つかりません
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          URLが間違っているか、ルームが削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-text-primary text-white py-2.5 px-6 rounded-md text-sm font-medium"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
