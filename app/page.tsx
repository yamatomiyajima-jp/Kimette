import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-text-primary">Kimette</h1>
          <p className="mt-2 text-text-secondary">
            チップを配分して、みんなで決めよう
          </p>
        </div>

        <Link
          href="/create"
          className="block w-full bg-text-primary text-white py-3 rounded-md font-medium text-center"
        >
          ルームを作成 →
        </Link>
      </div>
    </div>
  );
}
