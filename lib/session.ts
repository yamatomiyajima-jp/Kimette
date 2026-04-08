import { cookies } from "next/headers";

const PARTICIPANT_COOKIE_PREFIX = "kimette_participant_";

/** ルームごとの参加者IDを cookie から取得 */
export async function getParticipantId(roomId: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(`${PARTICIPANT_COOKIE_PREFIX}${roomId}`)?.value ?? null;
}

/** ルームごとの参加者IDを cookie に保存 */
export async function setParticipantId(
  roomId: string,
  participantId: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${PARTICIPANT_COOKIE_PREFIX}${roomId}`, participantId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日
    sameSite: "lax",
  });
}
