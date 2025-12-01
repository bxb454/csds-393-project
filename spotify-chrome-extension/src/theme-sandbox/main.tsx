import { createRoot } from "react-dom/client";
import { ThemeSandboxApp } from "./themeSandbox";

//create a new root and render our sandbox app this way
createRoot(document.getElementById("root")!).render(<ThemeSandboxApp />);