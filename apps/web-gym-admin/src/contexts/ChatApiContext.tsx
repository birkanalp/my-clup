'use client';

import { createContext, useContext, useMemo } from 'react';
import { getApi } from '@/src/lib/api';

type ApiType = ReturnType<typeof getApi>;

const ChatApiContext = createContext<ApiType | null>(null);

export function ChatApiProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo(() => getApi(), []);
  return <ChatApiContext.Provider value={api}>{children}</ChatApiContext.Provider>;
}

export function useChatApi(): ApiType | null {
  return useContext(ChatApiContext);
}
