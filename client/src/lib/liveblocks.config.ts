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

export const {
  suspense: {
    RoomProvider,
    useOthers,
    useUpdateMyPresence,
    useSelf,
    useRoom,
  },
} = createRoomContext<Presence, {}>(client);
export { client };