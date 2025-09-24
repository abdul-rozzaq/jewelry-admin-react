import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import "./i18n.ts";

import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./lib/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
