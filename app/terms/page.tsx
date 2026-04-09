import Link from "next/link";

export const metadata = {
  title: "利用規約 - Kimette",
};

export default function TermsPage() {
  return (
    <div className="flex justify-center bg-bg-secondary min-h-dvh">
      <div className="w-full max-w-lg bg-bg-primary min-h-dvh">
        <div className="px-6 py-8">
          <h1 className="text-lg font-bold text-text-primary mb-6">利用規約</h1>

          <div className="text-[13px] text-text-secondary leading-[1.9] space-y-5">
            <p>
              この利用規約（以下「本規約」）は、Kimette（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆さま（以下「ユーザー」）には、本規約に同意いただいた上で本サービスをご利用いただきます。
            </p>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第1条（適用）</h2>
              <p>本規約は、ユーザーと本サービスとの間の一切の関係に適用されます。</p>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第2条（利用条件）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>本サービスはアカウント登録不要で利用できます。</li>
                <li>ユーザーはURL共有を通じてルームに参加できます。</li>
                <li>ユーザーは自己の責任において本サービスを利用するものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第3条（禁止事項）</h2>
              <p>ユーザーは、以下の行為を行ってはなりません。</p>
              <ol className="list-decimal pl-5 space-y-1 mt-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスのサーバーまたはネットワークの機能を破壊・妨害する行為</li>
                <li>本サービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>本サービスに関連して反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第4条（本サービスの提供の停止等）</h2>
              <p>
                運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止・中断できるものとします。
              </p>
              <ol className="list-decimal pl-5 space-y-1 mt-1">
                <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により本サービスの提供が困難となった場合</li>
                <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第5条（データの取扱い）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>本サービスで作成されたルームおよび関連データは、結果発表後30日で自動的に削除されます。</li>
                <li>ユーザーが入力したニックネーム、商品名、コメント等の情報は、ルームの参加者間で共有されます。</li>
                <li>運営者は、データの永続的な保存を保証しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第6条（免責事項）</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>運営者は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しません。</li>
                <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[15px] font-medium text-text-primary mb-2">第7条（本規約の変更）</h2>
              <p>
                運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更できるものとします。変更後の利用規約は、本ページに掲示された時点から効力を生じるものとします。
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
