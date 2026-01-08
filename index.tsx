import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Buffer } from 'buffer';
window.global = window;
window.Buffer = Buffer;
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);