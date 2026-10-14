import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "katex/dist/katex.min.css";

// 未捕获异常写入 console，经主进程 console-message 转发到 SUIJI_DEBUG_LOG
window.addEventListener("error", (event) => {
  console.error(`[uncaught] ${event.message} @ ${event.filename}:${event.lineno}:${event.colno}`);
});
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? `${event.reason.message}\n${event.reason.stack ?? ""}` : String(event.reason);
  console.error(`[unhandledrejection] ${reason}`);
});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
