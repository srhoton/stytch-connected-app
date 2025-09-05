import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { StytchProvider } from './providers/StytchProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import '@/styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <StytchProvider>
          <App />
        </StytchProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);