// app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { store, persistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import WagmiWrapper from '@/components/WagmiWrapper';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
      <WagmiWrapper>
        <Toaster />
        {children}
      </WagmiWrapper>
      </PersistGate>
    </Provider>
  );
}
