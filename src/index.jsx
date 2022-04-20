import React from "react";
import ReactDOM from "react-dom";

import 'rsuite/dist/rsuite.min.css';
// Import and apply CSS stylesheet
import './styles/styles.css';

import App from "./app.jsx";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://vitejs.dev/guide/api-hmr.html
// if (import.meta.hot) {
//   import.meta.hot.accept();
// }
