// ============================================
// Kimette データベース型定義
// ============================================

export type RoomPhase = "registration" | "voting" | "closed";
export type StartMode = "manual" | "scheduled";

export interface Room {
  id: string;
  name: string;
  url_slug: string;
  chips_per_person: number;
  phase: RoomPhase;
  start_mode: StartMode;
  voting_starts_at: string | null;
  show_others_votes: boolean;
  show_vote_breakdown: boolean;
  comments_anonymous: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface Participant {
  id: string;
  room_id: string;
  nickname: string;
  is_creator: boolean;
  joined_at: string;
}

export interface Item {
  id: string;
  room_id: string;
  added_by: string;
  name: string;
  description: string | null;
  image_url: string | null;
  product_url: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  participant_id: string;
  item_id: string;
  chips: number;
  updated_at: string;
}

export interface Comment {
  id: string;
  participant_id: string;
  item_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}
