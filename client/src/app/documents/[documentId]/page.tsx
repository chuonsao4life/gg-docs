"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import LexicalEditor from "@/components/editor/LexicalEditor";
import type { EditorAdapter } from "@/types/editor-adapter";
import {
  RoomProvider,
  useRoom,
  useUpdateMyPresence,
} from "@/lib/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import {
  getDashboardDocument,
  getDocumentSnapshot,
  saveDocumentSnapshot,
} from "@/services/document.service";
import { getStoredAccessToken, getStoredUser, onSessionChange } from "@/services/auth.service";
import { getStableColor } from "@/lib/colors";

type Props = {
  params: Promise<{
    documentId: string;
  }>;
};

const TAB_SESSION_ID = Math.random().toString(36).substring(7);



function DocumentPageContent({ documentId }: { documentId: string }) {
  const room = useRoom();
  const updateMyPresence = useUpdateMyPresence();
  const doc = useMemo(() => new Y.Doc(), []);
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(getStoredUser());
  const [title, setTitle] = useState("Tài liệu chưa có tiêu đề");
  const [myPermission, setMyPermission] = useState<{
    canEdit?: boolean;
    canComment?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Tạo displayName từ available fields
  const displayName =
    userInfo?.firstname && userInfo?.lastname
      ? `${userInfo.firstname} ${userInfo.lastname}`
      : userInfo?.username || "Người dùng ẩn danh";

  // Debug userInfo
  console.log("✅ userInfo lúc render:", userInfo);
  console.log("✨ displayName:", displayName);
  console.log("🔧 DocumentPageContent mounted, documentId:", documentId);

  // Logic đồng bộ hóa Yjs Provider từ branch develop/dashboard
  const yProvider = useMemo(() => {
    if (!room || !doc) return null;
    const provider = new LiveblocksYjsProvider(room, doc);
    (provider as any).doc = doc;
    return provider;
  }, [room, doc]);

  const [adapter, setAdapter] = useState<EditorAdapter | null>(null);

  // Update presence với userInfo (broadcast qua Liveblocks)
  useEffect(() => {
    console.log(
      " Update Presence Effect - displayName:",
      displayName,
      "updateMyPresence:",
      !!updateMyPresence,
    );
    if (displayName && updateMyPresence) {
      updateMyPresence({
        userInfo: {
          name: displayName,
          color:
            userInfo?.color || getStableColor(displayName + TAB_SESSION_ID),
        },
      });
      console.log("Broadcast displayName qua Liveblocks:", displayName);
    }
  }, [displayName, userInfo, updateMyPresence]);

  // Listen storage event (cross-tab) AND onSessionChange (same-tab) để sync userInfo
  useEffect(() => {
    const syncUserInfo = () => {
      const storedUser = getStoredUser();
      setUserInfo(storedUser);
      console.log("Sync userInfo (storage/session event):", storedUser);
    };

    window.addEventListener("storage", syncUserInfo);
    const unsubscribe = onSessionChange(syncUserInfo);
    return () => {
      window.removeEventListener("storage", syncUserInfo);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!yProvider) return;
    if (yProvider.synced) {
      console.log("Đã đồng bộ từ trước (synced: true)");
    }
    const handleSync = (isSynced: boolean) => {
      console.log("Trạng thái đồng bộ thay đổi:", isSynced);
    };
    yProvider.on("sync", handleSync);
    return () => {
      yProvider.off("sync", handleSync);
    };
  }, [yProvider]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDashboardDocument(documentId)
      .then((response) => {
        if (active) {
          setTitle(response.document.title || "Untitled document");
          setMyPermission(response.myPermission || { canEdit: true });
          setLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          setLoading(false);
          router.replace("/dashboard");
        }
      });
    return () => {
      active = false;
    };
  }, [documentId, router]);

  console.log("📝 Editor state:", { editor: !!adapter, userInfo });

  useEffect(() => {
    // Chỉ update user info khi displayName thay đổi, không recreate editor
    if (adapter && displayName && yProvider) {
      console.log(
        "🎨 Update cursor info (không recreate editor):",
        displayName,
      );

      const color = userInfo?.color || getStableColor(displayName + TAB_SESSION_ID);

      // Directly update Yjs awareness state so remote cursors show the new name
      const awareness = yProvider.awareness;
      const localState = awareness.getLocalState();
      if (localState) {
        awareness.setLocalState({
          ...localState,
          name: displayName,
          color,
        });
      }

      adapter.updateUser({ name: displayName, color });
    }
  }, [displayName, adapter, userInfo, yProvider]);

  // Prevent Yjs awareness from timing out (default is 30s).
  // This ensures the remote cursor stays visible as long as the user is in the room.
  useEffect(() => {
    if (!yProvider) return;
    const interval = setInterval(() => {
      const state = yProvider.awareness.getLocalState();
      if (state) {
        yProvider.awareness.setLocalState(state);
      }
    }, 15000); // ping every 15 seconds
    return () => clearInterval(interval);
  }, [yProvider]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Đang tải tài liệu...
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      documentId={documentId}
      title={title}
      editor={adapter}
      canEdit={myPermission?.canEdit ?? false}
    >
      <LexicalEditor
        documentId={documentId}
        doc={doc}
        yProvider={yProvider}
        onReady={setAdapter}
        canEdit={myPermission?.canEdit ?? false}
        currentUserInfo={displayName ? { name: displayName, color: userInfo?.color || getStableColor(displayName + TAB_SESSION_ID) } : undefined}
      />
    </AppLayout>
  );
}

export default function Page({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const authChecked = Boolean(getStoredAccessToken());

  // Auth Guard từ Dashboard branch
  useEffect(() => {
    if (isMounted && !authChecked) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isMounted, authChecked, router]);

  if (!isMounted || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-slate-900 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-sm font-medium text-muted-foreground">
            Đang bảo mật kết nối...
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider
      id={resolvedParams.documentId}
      initialPresence={{ cursor: null, selection: null } as any}
    >
      <ClientSideSuspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-sm text-muted-foreground">
              Đang tải không gian làm việc...
            </div>
          </div>
        }
      >
        {() => <DocumentPageContent documentId={resolvedParams.documentId} />}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
