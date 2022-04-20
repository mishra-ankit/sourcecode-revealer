import React from "react";
import ReactDOM from "react-dom";

import 'rsuite/dist/rsuite.min.css';
// Import and apply CSS stylesheet
import './styles/styles.css';

import App from "./App.jsx";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
