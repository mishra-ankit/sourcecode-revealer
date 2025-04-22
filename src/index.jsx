import React from "react";
import { createRoot } from 'react-dom/client';

import 'rsuite/dist/rsuite.min.css';
// Import and apply CSS stylesheet
import './styles/styles.css';

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
