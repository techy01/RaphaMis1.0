import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { DepartmentNotificationProvider } from './contexts/DepartmentNotificationContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import App from './App';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <OfflineSyncProvider>
          <AuthProvider>
            <CurrencyProvider>
              <DepartmentNotificationProvider>
                <App />
              </DepartmentNotificationProvider>
            </CurrencyProvider>
          </AuthProvider>
        </OfflineSyncProvider>
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);
