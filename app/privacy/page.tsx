import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー - Kimette",
};

export default function PrivacyPage() {
  return (
    <div className="flex justify-center bg-bg-secondary min-h-dvh">
      <div className="w-full max-w-lg bg-bg-primary min-h-dvh">
        <div className="px-6 py-8">
          <h1 className="text-lg font-bold text-text-primary mb-6">プライバシーポリシー</h1>

          <div className="text-[13px] text-text-secondary leading-[1.9] space-y-5">
            <p>
              Kimette（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける情報の取扱いについて定めるものです。
            </p>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">1. 収集する情報</h2>
              <p>本サービスでは、以下の情報を収集します。</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li><strong>ニックネーム</strong>：ルームへの参加時にユーザーが任意に入力する表示名です。実名である必要はありません。</li>
                <li><strong>投票・コメントデータ</strong>：ルーム内でのチップ配分、商品情報、コメント等の操作データです。</li>
                <li><strong>アクセスログ</strong>：サービス改善のため、Google Analyticsを通じてアクセス情報（ページビュー、参照元、デバイス情報等）を収集します。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">2. 情報の利用目的</h2>
              <p>収集した情報は、以下の目的で利用します。</p>
              <ol className="list-decimal pl-5 space-y-1 mt-1">
                <li>本サービスの提供・運営</li>
                <li>本サービスの改善・新機能の開発</li>
                <li>利用状況の統計・分析</li>
                <li>お問い合わせへの対応</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">3. 情報の共有</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>ニックネーム、投票内容、コメントはルームの参加者間で共有されます。匿名設定を有効にした場合、名前は非表示になります。</li>
                <li>運営者は、法令に基づく場合を除き、ユーザーの情報を第三者に提供しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">4. Google Analytics の利用</h2>
              <p>
                本サービスでは、利用状況を把握するためにGoogle Analyticsを使用しています。Google Analyticsはcookieを使用してデータを収集しますが、個人を特定する情報は含まれません。データの収集・処理についてはGoogleのプライバシーポリシーをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">5. データの保存と削除</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>ルームに関連するデータ（ニックネーム、商品、投票、コメント）は、結果発表後30日で自動的に削除されます。</li>
                <li>本サービスはアカウント制ではないため、ユーザー個人に紐づくデータは保持しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">6. セキュリティ</h2>
              <p>
                本サービスは、情報の漏洩、紛失、改ざんを防止するために、適切なセキュリティ対策を講じます。ただし、インターネット上の通信の完全な安全性を保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">7. 本ポリシーの変更</h2>
              <p>
                運営者は、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本ページに掲示された時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">8. お問い合わせ</h2>
              <p>
                本ポリシーに関するお問い合わせは、
                <a
                  href="https://forms.gle/E8RPxZ3UG64E4yYe7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-info underline"
                >
                  お問い合わせフォーム
                </a>
                よりお願いいたします。
              </p>
            </section>

            <p className="text-text-tertiary">2026年4月9日 制定</p>
          </div>

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
