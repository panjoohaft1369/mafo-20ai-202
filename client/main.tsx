import "./global.css";

import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.log('[SW] Service Worker registration failed:', error);
      });
  });
}
