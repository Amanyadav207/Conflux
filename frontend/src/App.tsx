import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { connectYDoc } from "./ws-yjs";

// Language configuration for Piston API & Monaco
const LANGUAGES = {
  javascript: {
    name: "JavaScript",
    pistonRuntime: "javascript",
    pistonVersion: "18.15.0",
    monacoLanguage: "javascript",
    defaultCode: "console.log('Hello JavaScript!');"
  },
  typescript: {
    name: "TypeScript",
    pistonRuntime: "typescript",
    pistonVersion: "5.0.3",
    monacoLanguage: "typescript",
    defaultCode: "const msg: string = 'Hello TypeScript!';\nconsole.log(msg);"
  },
  python: {
    name: "Python",
    pistonRuntime: "python",
    pistonVersion: "3.10.0",
    monacoLanguage: "python",
    defaultCode: "print('Hello Python!')"
  },
  java: {
    name: "Java",
    pistonRuntime: "java",
    pistonVersion: "15.0.2",
    monacoLanguage: "java",
    defaultCode: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello Java!\");\n    }\n}"
  },
  csharp: {
    name: "C#",
    pistonRuntime: "csharp",
    pistonVersion: "6.12.0",
    monacoLanguage: "csharp",
    defaultCode: "using System;\n\npublic class Program\n{\n    public static void Main()\n    {\n        Console.WriteLine(\"Hello C#!\");\n    }\n}"
  }
};

type LanguageKey = keyof typeof LANGUAGES;

const getRoom = () =>
  new URL(location.href).searchParams.get("room") || "default-room";

export default function App() {
  const room = useMemo(getRoom, []);
  const { ytext, ws } = useMemo(() => connectYDoc(room), [room]);
  const [connected, setConnected] = useState<boolean>(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // State
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageKey>("typescript");

  // Track WS status
  useEffect(() => {
    if (!ws) return;
    const handleOpen = () => setConnected(true);
    const handleClose = () => setConnected(false);
    const handleError = () => setConnected(false);

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("close", handleClose);
    ws.addEventListener("error", handleError);

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("close", handleClose);
      ws.removeEventListener("error", handleError);
    };
  }, [ws]);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const model =
      editor.getModel() ??
      monaco.editor.createModel(
        LANGUAGES[language].defaultCode,
        LANGUAGES[language].monacoLanguage
      );

    new MonacoBinding(ytext, model, new Set([editor]), undefined);

    monaco.editor.defineTheme("tiny-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
      }
    });

    monaco.editor.setTheme("tiny-dark");
  };

  // Switch language helper
  const handleLanguageChange = (newLang: LanguageKey) => {
    setLanguage(newLang);

    // Update syntax highlighting
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelLanguage(model, LANGUAGES[newLang].monacoLanguage);
    }

    // Insert Default Code (User requested)
    if (ytext) {
      ytext.delete(0, ytext.length); // Clear existing
      ytext.insert(0, LANGUAGES[newLang].defaultCode); // Insert new
    }
  };

  const handleRoomChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newRoom = (e.currentTarget as HTMLInputElement).value.trim();
      if (newRoom && newRoom !== room) {
        // Simple reload to switch rooms cleanly
        const url = new URL(window.location.href);
        url.searchParams.set("room", newRoom);
        window.location.href = url.toString();
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      alert("Share link copied!");
    } catch {
      prompt("Copy this link:", location.href);
    }
  };

  const runCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    const config = LANGUAGES[language];

    setIsRunning(true);
    setOutput("");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.pistonRuntime,
          version: config.pistonVersion,
          files: [{ content: code }]
        })
      });
      const data = await response.json();

      if (data.run) {
        setOutput(data.run.output || (data.run.stderr ? `Error: ${data.run.stderr}` : "No output"));
      } else {
        setOutput("Error: Failed to execute code");
      }
    } catch (err: any) {
      setOutput(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearDoc = () => {
    const len = ytext.length;
    if (len > 0) ytext.delete(0, len);
  };

  return (
    <div className="app">
      <div className="topbar">
        <div className="left-group">
          <span className="brand">TinyCollab</span>
          <span className="kv">
            Room:
            <input
              className="room-input"
              defaultValue={room}
              onKeyDown={handleRoomChange}
              title="Press Enter to switch room"
            />
          </span>
          <span className="kv">
            <span className={`dot ${connected ? "ok" : "bad"}`} />
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="right-group">
          <select
            className="select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
          >
            {Object.entries(LANGUAGES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>

          <button className="btn run-btn" onClick={runCode} disabled={isRunning}>
            {isRunning ? "Running..." : "▶ Run"}
          </button>
          <button className="btn secondary" onClick={copyLink}>
            Share
          </button>
          <button className="btn secondary" onClick={clearDoc}>
            Clear
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="editor-wrap">
          <Editor
            height="100%"
            language={LANGUAGES[language].monacoLanguage} // Reactive prop
            theme="vs-dark"
            onMount={onMount}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 }
            }}
          />
        </div>

        <div className="output-panel">
          <div className="output-header">
            Terminal
          </div>
          <div className="output-content" style={{ opacity: output ? 1 : 0.7 }}>
            {output || <span className="placeholder">Run code to see output...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
