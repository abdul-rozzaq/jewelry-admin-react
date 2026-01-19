import { createRoot } from "react-dom/client";

import "./index.css";

import "./i18n";

import store from "./lib/store";

import App from "./App";
import { Provider } from "react-redux";

import { pushNotificationService } from "./lib/pushNotification";

// Initialize push notifications when app loads
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Check if push notifications are already supported
    if (pushNotificationService.isSupported()) {
      console.log("Push notifications are supported");
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
