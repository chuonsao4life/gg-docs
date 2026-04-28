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
    picture: string;
  };
};

// Định nghĩa kiểu dữ liệu lưu trữ trong Storage (nếu có)
type Storage = {
};

export const {
  suspense: {
    RoomProvider,
    useOthers,
    useSelf,
    useUpdateMyPresence,
  },
} = createRoomContext<Presence, Storage>(client);