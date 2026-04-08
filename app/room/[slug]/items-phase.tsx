"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Room, Item, Participant } from "@/lib/types";
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

  const getParticipantName = useCallback(
    (participantId: string) => {
      return (
        participants.find((p) => p.id === participantId)?.nickname ?? "不明"
      );
    },
    [participants]
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

      {/* 招待リンク */}
      <InviteLinkButton slug={room.url_slug} />

      {/* 商品リスト */}
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          authorName={getParticipantName(item.added_by)}
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
        <form action={startVoting}>
          <input type="hidden" name="roomId" value={room.id} />
          <input type="hidden" name="slug" value={room.url_slug} />
          <button
            type="submit"
            disabled={items.length === 0}
            className="w-full py-[13px] bg-text-primary text-white text-sm font-medium rounded-md disabled:opacity-40"
          >
            投票を開始 →
          </button>
        </form>
      )}
    </div>
  );
}

function ItemCard({
  item,
  authorName,
  isOwner,
  isEditing,
  onEdit,
  onCancelEdit,
  roomId,
  slug,
}: {
  item: Item;
  authorName: string;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  roomId: string;
  slug: string;
}) {
  return (
    <div className="flex gap-2.5 p-2.5 border-[0.5px] border-black/15 rounded-md mb-2">
      {/* サムネイル */}
      <div className="w-11 h-11 bg-bg-secondary rounded-md shrink-0 flex items-center justify-center text-xl">
        📦
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div>
            <div className="text-[13px] font-medium">{item.name}</div>
            <div className="text-[11px] text-text-tertiary">
              {authorName}が追加
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
  onClose,
}: {
  roomId: string;
  slug: string;
  onClose: () => void;
}) {
  async function handleSubmit(formData: FormData) {
    await addItem(formData);
    onClose();
  }

  return (
    <form
      action={handleSubmit}
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
        placeholder="例: スタバのカード"
        className="w-full px-3 py-2 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-3"
      />

      <label className="text-[13px] text-text-secondary block mb-1.5">
        説明（任意）
      </label>
      <textarea
        name="description"
        rows={2}
        placeholder="商品の説明を追加"
        className="w-full px-3 py-2 text-sm border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-3 resize-none"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 text-[13px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-[13px] bg-text-primary text-white rounded-md font-medium"
        >
          追加
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

function InviteLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const url = `${window.location.origin}/room/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック: 古いブラウザ向け
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`w-full py-2.5 text-[13px] rounded-md mb-4 font-medium transition-colors ${
        copied
          ? "bg-bg-success text-text-success"
          : "bg-bg-info text-text-info"
      }`}
    >
      {copied ? "✓ コピーしました" : "📋 招待リンクをコピー"}
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
  async function handleSubmit(formData: FormData) {
    await updateItem(formData);
    onClose();
  }

  return (
    <form action={handleSubmit} className="mt-2">
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="slug" value={slug} />

      <textarea
        name="description"
        rows={2}
        defaultValue={item.description ?? ""}
        placeholder="商品の説明を追加"
        className="w-full px-2 py-1.5 text-xs border-[0.5px] border-black/30 rounded-md bg-bg-primary text-text-primary mb-2 resize-none"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-1 text-[10px] bg-bg-primary border-[0.5px] border-black/30 rounded-md text-text-primary"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-1 text-[10px] bg-text-primary text-white rounded-md font-medium"
        >
          保存
        </button>
      </div>
    </form>
  );
}
