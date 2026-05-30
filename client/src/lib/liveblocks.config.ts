import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type Presence = {
  cursor: { x: number; y: number } | null;
  userInfo: {
    name: string;
    color: string;
    picture?: string;
  };
};

type RoomEvent = {
  type: "DOCUMENT_COMMENT_CHANGED";
  documentId: string;
  action: "created" | "updated" | "deleted";
  commentId?: string;
};

export const {
  suspense: {
    RoomProvider,
    useOthers,
    useUpdateMyPresence,
    useSelf,
    useRoom,
    useBroadcastEvent,
    useEventListener,
  },
} = createRoomContext<Presence, {}, {}, RoomEvent>(client);
export { client };
