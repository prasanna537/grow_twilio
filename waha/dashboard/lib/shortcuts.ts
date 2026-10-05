"use client";

import { useEffect } from "react";

export interface ShortcutBinding {
  key: string; // e.g. "/", "n", "?", "d", "s"
  ctrlOrCmd?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutBinding[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire shortcuts if focus is inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        // Exception: allow Escape key to blur
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      for (const shortcut of shortcuts) {
        const matchKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchModifier = shortcut.ctrlOrCmd
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;

        if (matchKey && matchModifier) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
