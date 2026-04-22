
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "highlight.js/styles/github-dark.css";

  createRoot(document.getElementById("root")!).render(<App />);
  