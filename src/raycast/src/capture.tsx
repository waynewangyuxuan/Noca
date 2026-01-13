import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  Clipboard,
  popToRoot,
} from "@raycast/api";
import { useState, useEffect } from "react";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { detectCaptureType } from "./utils/detection";

interface Capture {
  content: string;
  type: "url" | "text";
  note: string | null;
  time: string;
}

const CAPTURE_DIR = path.join(os.homedir(), "noca/captures");

export default function Command() {
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");

  // Load clipboard on mount
  useEffect(() => {
    async function loadClipboard() {
      const text = await Clipboard.readText();
      if (text) {
        setContent(text);
      }
    }
    loadClipboard();
  }, []);

  async function handleSubmit() {
    if (!content.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Content is empty",
      });
      return;
    }

    try {
      // Ensure directory exists
      if (!fs.existsSync(CAPTURE_DIR)) {
        fs.mkdirSync(CAPTURE_DIR, { recursive: true });
      }

      // Today's file (use local date, not UTC)
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const filePath = path.join(CAPTURE_DIR, `${today}.json`);

      // Load existing captures
      let captures: Capture[] = [];
      if (fs.existsSync(filePath)) {
        captures = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }

      // Detect type and add capture
      const type = detectCaptureType(content.trim());
      captures.push({
        content: content.trim(),
        type,
        note: note.trim() || null,
        time: new Date().toTimeString().split(" ")[0],
      });

      // Write file
      fs.writeFileSync(filePath, JSON.stringify(captures, null, 2));

      await showToast({
        style: Toast.Style.Success,
        title: "Captured!",
        message: `${captures.length} items today`,
      });

      popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to save",
        message: String(error),
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Paste or type anything..."
        value={content}
        onChange={setContent}
      />
      <Form.TextField
        id="note"
        title="Note"
        placeholder="Optional note..."
        value={note}
        onChange={setNote}
      />
    </Form>
  );
}
