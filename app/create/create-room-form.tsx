"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "./actions";

export function CreateRoomForm() {
  const router = useRouter();
  const [showOthersVotes, setShowOthersVotes] = useState(true);
  const [showVoteBreakdown, setShowVoteBreakdown] = useState(false);
  const [commentsAnonymous, setCommentsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const slug = await createRoom(formData);
      router.push(`/room/${slug}`);
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

      {/* トグル設定 */}
      <div className="bg-bg-secondary rounded-md p-3 mb-[18px]">
        <ToggleRow
          label="他人の投票状況を表示"
          checked={showOthersVotes}
          onChange={setShowOthersVotes}
          name="showOthersVotes"
        />
        <ToggleRow
          label="結果に投票内訳を表示"
          checked={showVoteBreakdown}
          onChange={setShowVoteBreakdown}
          name="showVoteBreakdown"
        />
        <ToggleRow
          label="コメントを匿名にする"
          checked={commentsAnonymous}
          onChange={setCommentsAnonymous}
          name="commentsAnonymous"
          isLast
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

function ToggleRow({
  label,
  checked,
  onChange,
  name,
  isLast = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  name: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center ${isLast ? "" : "mb-2.5"}`}
    >
      <span className="text-[13px]">{label}</span>
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-[10px] ${
          checked
            ? "bg-bg-info text-text-info"
            : "bg-bg-secondary text-text-secondary border-[0.5px] border-black/15"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}
