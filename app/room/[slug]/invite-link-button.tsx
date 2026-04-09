"use client";

import { useState, useEffect, useRef } from "react";

export function InviteLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleShare() {
    const url = `${window.location.origin}/room/${slug}`;
    const text = "Kimetteで一緒に投票しよう！";

    if (navigator.share) {
      try {
        await navigator.share({ title: "Kimette", text, url });
        return;
      } catch {
        // キャンセル時は何もしない
      }
      return;
    }

    // フォールバック: クリップボードにコピー
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`w-full py-2.5 text-[13px] rounded-md mb-4 font-medium transition-colors ${
        copied
          ? "bg-bg-success text-text-success"
          : "bg-bg-info text-text-info"
      }`}
    >
      {copied ? "✓ コピーしました" : "招待リンクを共有"}
    </button>
  );
}
