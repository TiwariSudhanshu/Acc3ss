// app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import WagmiWrapper from '@/components/WagmiWrapper';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WagmiWrapper>
        <Toaster />
        {children}
      </WagmiWrapper>
    </Provider>
  );
}
