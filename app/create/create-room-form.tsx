"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "./actions";
import type { AnonymousMode, VoteVisibility } from "@/lib/types";

export function CreateRoomForm() {
  const router = useRouter();
  const [voteVisibility, setVoteVisibility] = useState<VoteVisibility>("total_only");
  const [votesAnonymous, setVotesAnonymous] = useState<AnonymousMode>("off");
  const [commentsAnonymous, setCommentsAnonymous] = useState<AnonymousMode>("off");
  const [itemsAnonymous, setItemsAnonymous] = useState<AnonymousMode>("off");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const slug = await createRoom(formData);
      router.replace(`/room/${slug}`);
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit}>
      <label className="text-[13px] text-text-secondary block mb-1.5">
        あなたのニックネーム
      </label>
      <input
        type="text"
        name="nickname"
        required
        className="w-full px-3 py-2.5 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-4"
      />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        ルーム名
      </label>
      <input
        type="text"
        name="roomName"
        required
        placeholder="例: 田中さんの誕生日プレゼント"
        className="w-full px-3 py-2.5 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-4"
      />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        1人あたりのチップ数
      </label>
      <input
        type="number"
        name="chipsPerPerson"
        defaultValue={10}
        min={1}
        required
        className="w-full px-3 py-2.5 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-4"
      />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        投票開始のタイミング
      </label>
      <select
        name="startMode"
        defaultValue="manual"
        className="w-full px-3 py-2.5 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-4"
      >
        <option value="manual">作成者が手動で開始</option>
        <option value="scheduled">期日で自動開始</option>
      </select>

      {/* 詳細設定 */}
      <div className="bg-bg-secondary rounded-md p-3 mb-[18px] space-y-3">
        <SelectRow
          label="投票状況の公開"
          name="voteVisibility"
          value={voteVisibility}
          onChange={(v) => setVoteVisibility(v as VoteVisibility)}
          options={[
            { value: "hidden", label: "非公開" },
            { value: "total_only", label: "合計のみ" },
            { value: "detailed", label: "詳細表示" },
          ]}
        />
        <SelectRow
          label="投票の匿名"
          name="votesAnonymous"
          value={votesAnonymous}
          onChange={(v) => setVotesAnonymous(v as AnonymousMode)}
          options={[
            { value: "off", label: "名前を表示" },
            { value: "optional", label: "匿名を選択可" },
            { value: "on", label: "全員匿名" },
          ]}
        />
        <SelectRow
          label="コメントの匿名"
          name="commentsAnonymous"
          value={commentsAnonymous}
          onChange={(v) => setCommentsAnonymous(v as AnonymousMode)}
          options={[
            { value: "off", label: "名前を表示" },
            { value: "optional", label: "匿名を選択可" },
            { value: "on", label: "全員匿名" },
          ]}
        />
        <SelectRow
          label="商品登録者の表示"
          name="itemsAnonymous"
          value={itemsAnonymous}
          onChange={(v) => setItemsAnonymous(v as AnonymousMode)}
          options={[
            { value: "off", label: "名前を表示" },
            { value: "optional", label: "匿名を選択可" },
            { value: "on", label: "全員匿名" },
          ]}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md disabled:opacity-50"
      >
        {isSubmitting ? "作成中..." : "ルームを作成 →"}
      </button>
    </form>
  );
}

function SelectRow({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px]">{label}</span>
      <input type="hidden" name={name} value={value} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[11px] font-medium px-2 py-0.5 rounded-[10px] bg-bg-info text-text-info border-0 appearance-none text-center"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
