"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Room, Item, Participant } from "@/lib/types";
import { ParticipantsList } from "./participants-list";
import { addItem, updateItem, deleteItem, startVoting } from "./actions";

interface ItemsPhaseProps {
  room: Room;
  items: Item[];
  participants: Participant[];
  currentParticipant: Participant;
}

export function ItemsPhase({
  room,
  items: initialItems,
  participants,
  currentParticipant,
}: ItemsPhaseProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Realtime 購読
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${room.id}:items`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          // 変更があったらページをリフレッシュ
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, router]);

  // initialItems が更新されたら反映
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const getAuthorDisplay = useCallback(
    (item: Item) => {
      // 全員匿名の場合
      if (room.items_anonymous === "on") return "匿名が追加";
      // 匿名選択可で、登録者が匿名を選んだ場合
      if (room.items_anonymous === "optional" && item.is_anonymous) return "匿名が追加";
      // 通常表示
      const name = participants.find((p) => p.id === item.added_by)?.nickname ?? "不明";
      return `${name}が追加`;
    },
    [participants, room.items_anonymous]
  );

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-[17px] font-medium text-text-primary">
          商品を追加
        </h1>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[10px] bg-bg-info text-text-info">
          登録中
        </span>
      </div>
      <p className="text-xs text-text-secondary mt-0 mb-[18px]">
        候補と説明を自由に追加できます
      </p>

      {/* 参加者リスト */}
      <ParticipantsList
        participants={participants}
        isAnonymous={room.items_anonymous === "on"}
      />

      {/* 招待リンク */}
      <InviteLinkButton slug={room.url_slug} />

      {/* 商品リスト */}
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          authorDisplay={getAuthorDisplay(item)}
          isOwner={item.added_by === currentParticipant.id}
          isEditing={editingItemId === item.id}
          onEdit={() => setEditingItemId(item.id)}
          onCancelEdit={() => setEditingItemId(null)}
          roomId={room.id}
          slug={room.url_slug}
        />
      ))}

      {/* 商品追加フォーム */}
      {showAddForm ? (
        <AddItemForm
          roomId={room.id}
          slug={room.url_slug}
          itemsAnonymous={room.items_anonymous}
          onClose={() => setShowAddForm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 text-[13px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary mb-3"
        >
          + 商品を追加
        </button>
      )}

      {/* 投票開始ボタン（作成者のみ） */}
      {currentParticipant.is_creator && (
        <StartVotingButton roomId={room.id} slug={room.url_slug} disabled={items.length === 0} />
      )}
    </div>
  );
}

function ItemCard({
  item,
  authorDisplay,
  isOwner,
  isEditing,
  onEdit,
  onCancelEdit,
  roomId,
  slug,
}: {
  item: Item;
  authorDisplay: string;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  roomId: string;
  slug: string;
}) {
  return (
    <div className="p-2.5 border-[0.5px] border-black/15 rounded-md mb-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div>
            <div className="text-[13px] font-medium">
              {item.product_url ? (
                <a
                  href={item.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-info underline"
                >
                  {item.name}
                </a>
              ) : (
                item.name
              )}
            </div>
            <div className="text-[11px] text-text-tertiary">
              {authorDisplay}
            </div>
          </div>
          {isOwner && (
            <DeleteItemButton
              itemId={item.id}
              roomId={roomId}
              slug={slug}
            />
          )}
        </div>

        {/* 説明文 */}
        {isEditing ? (
          <EditDescriptionForm
            item={item}
            roomId={roomId}
            slug={slug}
            onClose={onCancelEdit}
          />
        ) : (
          <>
            {item.description && (
              <div className="mt-2 p-2 bg-bg-secondary rounded-md text-xs leading-relaxed">
                {item.description}
              </div>
            )}
            {isOwner && (
              <button
                type="button"
                onClick={onEdit}
                className="mt-1 text-[10px] text-text-tertiary border-[0.5px] border-black/30 rounded-md px-1.5 py-0.5"
              >
                {item.description ? "説明を編集" : "説明を追加"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AddItemForm({
  roomId,
  slug,
  itemsAnonymous,
  onClose,
}: {
  roomId: string;
  slug: string;
  itemsAnonymous: string;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addItem(formData);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-[0.5px] border-black/15 rounded-md p-3 mb-3"
    >
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="slug" value={slug} />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        商品名
      </label>
      <input
        type="text"
        name="name"
        required
        disabled={isSubmitting}
        placeholder="例: スタバのカード"
        className="w-full px-3 py-2 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-3 disabled:opacity-50"
      />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        商品リンク（任意）
      </label>
      <input
        type="url"
        name="productUrl"
        disabled={isSubmitting}
        placeholder="https://example.com/product"
        className="w-full px-3 py-2 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-3 disabled:opacity-50"
      />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        説明（任意）
      </label>
      <textarea
        name="description"
        rows={2}
        disabled={isSubmitting}
        placeholder="商品の説明を追加"
        className="w-full px-3 py-2 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-3 resize-none disabled:opacity-50"
      />

      {/* 匿名選択可の場合のみチェックボックスを表示 */}
      {itemsAnonymous === "optional" && (
        <label className="flex items-center gap-2 text-[13px] text-text-secondary mb-3 cursor-pointer">
          <input
            type="checkbox"
            name="isAnonymous"
            value="on"
            disabled={isSubmitting}
            className="w-4 h-4 rounded"
          />
          匿名で登録する
        </label>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 py-2 text-[13px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 text-[13px] bg-text-primary text-white rounded-md font-medium disabled:opacity-50"
        >
          {isSubmitting ? "追加しています..." : "追加"}
        </button>
      </div>
    </form>
  );
}

function DeleteItemButton({
  itemId,
  roomId,
  slug,
}: {
  itemId: string;
  roomId: string;
  slug: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.set("itemId", itemId);
      formData.set("roomId", roomId);
      formData.set("slug", slug);
      await deleteItem(formData);
    } catch {
      setIsDeleting(false);
      // エラーは握りつぶして静かに失敗させる
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[10px] text-text-tertiary px-1 disabled:opacity-30"
    >
      ✕
    </button>
  );
}

function StartVotingButton({
  roomId,
  slug,
  disabled,
}: {
  roomId: string;
  slug: string;
  disabled: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await startVoting(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md disabled:opacity-40"
      >
        {isSubmitting ? "開始しています..." : "投票を開始 →"}
      </button>
    </form>
  );
}

function InviteLinkButton({ slug }: { slug: string }) {
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

function EditDescriptionForm({
  item,
  roomId,
  slug,
  onClose,
}: {
  item: Item;
  roomId: string;
  slug: string;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateItem(formData);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="slug" value={slug} />

      <textarea
        name="description"
        rows={2}
        disabled={isSubmitting}
        defaultValue={item.description ?? ""}
        placeholder="商品の説明を追加"
        className="w-full px-2 py-1.5 text-xs border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-2 resize-none disabled:opacity-50"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 py-1 text-[10px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-1 text-[10px] bg-text-primary text-white rounded-md font-medium disabled:opacity-50"
        >
          {isSubmitting ? "保存しています..." : "保存"}
        </button>
      </div>
    </form>
  );
}
