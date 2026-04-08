"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinRoom } from "./actions";

interface JoinFormProps {
  roomId: string;
  slug: string;
}

export function JoinForm({ roomId, slug }: JoinFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.set("roomId", roomId);
    await joinRoom(formData);
    router.refresh();
  }

  return (
    <form action={handleSubmit}>
      <label className="text-[13px] text-text-secondary block mb-1.5">
        あなたのニックネームを入力
      </label>
      <input
        type="text"
        name="nickname"
        required
        placeholder="例: たろう"
        disabled={isSubmitting}
        className="w-full px-3 py-2.5 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-4 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md disabled:opacity-50"
      >
        {isSubmitting ? "参加しています..." : "参加する →"}
      </button>
    </form>
  );
}
