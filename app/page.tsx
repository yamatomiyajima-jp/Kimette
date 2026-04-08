import Image from "next/image";
import Link from "next/link";

const STEPS = [
  {
    num: "1",
    title: "ルームを作る",
    desc: "テーマを決めて、候補の商品を登録。URLを共有するだけで準備完了。",
  },
  {
    num: "2",
    title: "チップを配る",
    desc: "全員に同じ数のチップを配布。「ちょっといいな」に1枚、「絶対これ！」に5枚。気持ちの強さを自由に表現。",
  },
  {
    num: "3",
    title: "みんなで決まる",
    desc: "合計チップ数で結果が決定。コメントで理由も共有できる。",
  },
] as const;

const FEATURES = [
  {
    icon: "🎚️",
    title: "「ちょっといい」\nも伝わる",
    desc: "1票か0票かではなく、チップの枚数で気持ちの強さをそのまま表現できる。",
  },
  {
    icon: "🔗",
    title: "アカウント不要",
    desc: "URLを開いてニックネームを入れるだけ。面倒な登録は一切不要。",
  },
  {
    icon: "💬",
    title: "理由が見える",
    desc: "コメント機能で「なぜそれを選んだか」を共有。",
  },
  {
    icon: "🔧",
    title: "シーンに合わせて調整",
    desc: "匿名投票・投票状況の公開範囲・コメントの匿名など、用途に合わせて細かく設定可能。",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-10 pb-12 bg-gradient-to-b from-white to-bg-secondary">
        <div className="relative w-72 h-36 mb-4">
          <Image
            src="/hero.png"
            alt="Kimette!"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="text-[15px] text-text-primary text-center max-w-[300px] leading-relaxed font-medium">
          「どれでもいいよ」が、一番困る。
        </p>
        <p className="text-[15px] text-text-primary text-center max-w-[300px] leading-relaxed font-medium mt-0.5">
          だから、Kimette。
        </p>
        <p className="mt-1.5 text-xs text-text-tertiary">
          アカウント不要・URL共有だけで使える
        </p>

        <Link
          href="/create"
          className="mt-8 w-full max-w-xs block bg-text-info text-white py-3.5 rounded-xl font-medium text-center text-base shadow-lg shadow-text-info/20 active:scale-[0.98] transition-transform"
        >
          ルームを作成する
        </Link>
      </section>

      {/* About */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Kimette とは？
          </h2>
          <p className="text-[13px] text-text-secondary leading-[1.9]">
            Kimette は、チップを配分して投票する意思決定サービスです。多数決では表現できない「どっちもいいけど、こっちがちょっといい」という微妙な気持ちの差を、チップの枚数で正確に伝えることができます。
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-12 bg-bg-secondary">
        <h2 className="text-center text-lg font-bold text-text-primary mb-8">
          使い方はかんたん
        </h2>
        <div className="max-w-sm mx-auto flex flex-col gap-5">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-4 items-start">
              <div className="shrink-0 w-9 h-9 rounded-full bg-text-info text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {step.num}
              </div>
              <div className="pt-0.5">
                <h3 className="font-bold text-[15px] text-text-primary">
                  {step.title}
                </h3>
                <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-12 bg-white">
        <h2 className="text-center text-lg font-bold text-text-primary mb-8">
          Kimette の特徴
        </h2>
        <div className="max-w-sm mx-auto grid grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-bg-secondary rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-[13px] text-text-primary mb-1 whitespace-pre-line">
                {f.title}
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Use case */}
      <section className="px-6 py-12 bg-bg-secondary">
        <h2 className="text-center text-lg font-bold text-text-primary mb-3">
          こんなときに使える
        </h2>
        <div className="max-w-sm mx-auto flex flex-col gap-2.5">
          {[
            "誕生日プレゼント選び",
            "チームのランチ場所決め",
            "旅行先の候補を絞る",
            "イベントの企画決定",
          ].map((text) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-black/[0.06]"
            >
              <span className="text-text-info text-sm font-bold">✓</span>
              <span className="text-[13px] text-text-primary">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-14 bg-gradient-to-t from-white to-bg-secondary text-center">
        <p className="text-text-secondary text-sm mb-5">
          さっそく始めてみませんか？
        </p>
        <Link
          href="/create"
          className="inline-block w-full max-w-xs bg-text-info text-white py-3.5 rounded-xl font-medium text-base shadow-lg shadow-text-info/20 active:scale-[0.98] transition-transform"
        >
          ルームを作成する
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] text-text-tertiary bg-white border-t border-black/[0.06]">
        &copy; 2025 Kimette
      </footer>
    </div>
  );
}
