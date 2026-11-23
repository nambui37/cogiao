import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('PWA ServiceWorker registered successfully with scope:', registration.scope);
      },
      (error) => {
        console.warn('PWA ServiceWorker registration failed:', error);
      }
    );
  });
}

// Eliminate default browser popup alerts and confirms completely
window.alert = (msg) => {
  window.dispatchEvent(new CustomEvent('app-toast', { 
    detail: { message: String(msg), type: 'info' } 
  }));
};

window.confirm = (msg) => {
  console.warn("Native window.confirm was suppressed in favor of modern in-app dialogs. Message:", msg);
  window.dispatchEvent(new CustomEvent('app-toast', { 
    detail: { message: String(msg), type: 'warning', title: 'Thông báo xác nhận' } 
  }));
  return false;
};

window.prompt = (msg) => {
  console.warn("Native window.prompt was suppressed. Message:", msg);
  return null;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
