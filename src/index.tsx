import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("Initial Render Error:", e);
  // Fallback UI in case React fails to mount completely
  rootElement.innerHTML = `
    <div style="
      background-color: #1a1a1a; 
      color: #ff6b6b; 
      height: 100vh; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      font-family: sans-serif; 
      padding: 20px; 
      text-align: center;
    ">
      <h2 style="margin-bottom: 10px;">Critical Error</h2>
      <p style="color: #ccc; margin-bottom: 20px;">The application failed to start.</p>
      <pre style="
        background: #000; 
        padding: 15px; 
        border-radius: 8px; 
        overflow: auto; 
        max-width: 100%; 
        text-align: left; 
        font-size: 12px;
      ">${e instanceof Error ? e.message : String(e)}</pre>
      <button onclick="window.location.reload()" style="
        margin-top: 20px; 
        padding: 12px 24px; 
        background: #fff; 
        border: none; 
        border-radius: 25px; 
        font-weight: bold; 
        cursor: pointer;
      ">Reload App</button>
    </div>
  `;
}