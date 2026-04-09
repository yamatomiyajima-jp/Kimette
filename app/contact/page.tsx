import Link from "next/link";

export const metadata = {
  title: "お問い合わせ - Kimette",
};

export default function ContactPage() {
  return (
    <div className="flex justify-center bg-bg-secondary min-h-dvh">
      <div className="w-full max-w-lg bg-bg-primary min-h-dvh">
        <div className="px-6 py-8">
          <h1 className="text-lg font-bold text-text-primary mb-3">お問い合わせ</h1>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-6">
            Kimette に関するご質問・ご要望・不具合報告などは、以下のフォームからお送りください。
          </p>

          <a
            href="https://forms.gle/E8RPxZ3UG64E4yYe7"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md text-center"
          >
            お問い合わせフォームを開く
          </a>

          <div className="mt-8 text-center">
            <Link href="/" className="text-[13px] text-text-info">
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
