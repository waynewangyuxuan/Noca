import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  showToast,
  Toast,
  Clipboard,
} from "@raycast/api";
import { useState, useEffect } from "react";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

interface Capture {
  content: string;
  type: "url" | "text";
  note: string | null;
  time: string;
}

const CAPTURE_DIR = path.join(os.homedir(), "noca/captures");

export default function Command() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCaptures();
  }, []);

  function loadCaptures() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const filePath = path.join(CAPTURE_DIR, `${today}.json`);

      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        setCaptures(data.reverse()); // Show newest first
      } else {
        setCaptures([]);
      }
    } catch (error) {
      console.error("Failed to load captures:", error);
      setCaptures([]);
    }
    setIsLoading(false);
  }

  function getIcon(type: string) {
    return type === "url"
      ? { source: Icon.Link, tintColor: Color.Blue }
      : { source: Icon.Text, tintColor: Color.Green };
  }

  function truncate(text: string, length: number) {
    return text.length > length ? text.slice(0, length) + "..." : text;
  }

  return (
    <List isLoading={isLoading}>
      {captures.length === 0 ? (
        <List.EmptyView
          icon={Icon.Tray}
          title="No captures today"
          description="Use 'Noca Capture' to save something"
        />
      ) : (
        captures.map((capture, index) => (
          <List.Item
            key={index}
            icon={getIcon(capture.type)}
            title={truncate(capture.content, 60)}
            subtitle={capture.note || ""}
            accessories={[{ text: capture.time }]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Content"
                  content={capture.content}
                />
                {capture.type === "url" && (
                  <Action.OpenInBrowser url={capture.content} />
                )}
                {capture.note && (
                  <Action.CopyToClipboard
                    title="Copy Note"
                    content={capture.note}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                )}
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
