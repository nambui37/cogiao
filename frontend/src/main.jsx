import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

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
