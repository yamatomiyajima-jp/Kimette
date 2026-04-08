"use client";

import { useState, useEffect, useRef } from "react";

interface RankedItem {
  item: { name: string };
  totalChips: number;
  rank: number;
}

interface ShareButtonProps {
  roomName: string;
  rankedItems: RankedItem[];
  slug: string;
}

function buildShareText(roomName: string, rankedItems: RankedItem[]): string {
  const lines = [`${roomName} の投票結果`];
  lines.push("");
  for (const r of rankedItems) {
    const medal = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : "　";
    lines.push(`${medal} ${r.rank}位 ${r.item.name}（${r.totalChips}チップ）`);
  }
  lines.push("");
  lines.push("Kimette で投票しました");
  return lines.join("\n");
}

export function ShareButton({ roomName, rankedItems, slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleShare() {
    const text = buildShareText(roomName, rankedItems);
    const url = `${window.location.origin}/room/${slug}`;

    // Web Share API が使える場合（主にモバイル）
    if (navigator.share) {
      try {
        await navigator.share({ title: `${roomName} の投票結果`, text, url });
        return;
      } catch {
        // ユーザーがキャンセルした場合は何もしない
      }
      return;
    }

    // フォールバック: クリップボードにコピー
    const copyText = `${text}\n${url}`;
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
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
      className={`w-full py-[13px] text-sm font-medium rounded-md mt-4 transition-colors ${
        copied
          ? "bg-bg-success text-text-success"
          : "bg-bg-info text-text-info"
      }`}
    >
      {copied ? "✓ コピーしました" : "結果を共有する"}
    </button>
  );
}
