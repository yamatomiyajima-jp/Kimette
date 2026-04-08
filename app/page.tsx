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
    desc: "全員に同じ数のチップを配布。推しの商品にチップを自由に配分。",
  },
  {
    num: "3",
    title: "みんなで決まる",
    desc: "合計チップ数で結果が決定。コメントで理由も共有できる。",
  },
] as const;

const FEATURES = [
  {
    icon: "🔗",
    title: "アカウント不要",
    desc: "URLを開いてニックネームを入れるだけ。面倒な登録は一切なし。",
  },
  {
    icon: "🎯",
    title: "熱量が伝わる",
    desc: "チップを集中させれば「これが一番！」の気持ちがしっかり反映される。",
  },
  {
    icon: "⚖️",
    title: "全員が平等",
    desc: "持ちチップ数は全員同じ。声の大きさに左右されない公平な意思決定。",
  },
  {
    icon: "💬",
    title: "理由が見える",
    desc: "コメント機能で「なぜそれを選んだか」を共有。納得感のある結果に。",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-10 pb-12 bg-[#4a4a4a] overflow-hidden">
        {/* 背景グロー効果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a3a5a] via-[#4a4a4a] to-[#4a4a4a]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-72 h-36 mb-4">
            <Image
              src="/hero.png"
              alt="Kimette!"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-base text-white/80 text-center max-w-xs leading-relaxed">
            チップを配分して、みんなで決めよう
          </p>
          <p className="mt-1 text-xs text-white/50">
            アカウント不要・URL共有だけで使える
          </p>

          <Link
            href="/create"
            className="mt-8 w-full max-w-xs block bg-white text-[#2a3a5a] py-3.5 rounded-xl font-bold text-center text-base shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
          >
            ルームを作成する
          </Link>
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
              <h3 className="font-bold text-[13px] text-text-primary mb-1">
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
