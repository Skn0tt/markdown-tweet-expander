import * as vscode from "vscode";
import fetch from "node-fetch";

interface TwitterPublishResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height: number | null;
  type: "rich" | string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}

async function fetchTweet(url: string): Promise<string> {
  const res = await fetch(
    `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
  );
  const { html } = (await res.json()) as TwitterPublishResponse;
  return html;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "markdown-tweet-expander.expand",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const { document, selection } = editor;
      let url = document.getText(selection);
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Fetching tweet ...",
        },
        async () => {
          try {
            const html = await fetchTweet(url);
            editor.edit((editBuilder) => {
              editBuilder.replace(selection, html);
            });
          } catch (error) {
            vscode.window.showErrorMessage("Failed to fetch tweet.");
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
