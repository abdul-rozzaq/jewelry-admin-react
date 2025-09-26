import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import "./i18n";

import store from "./lib/store";
import { Provider } from "react-redux";
import App from "./App";

// import App from "./App.tsx";
// import store from "./lib/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
