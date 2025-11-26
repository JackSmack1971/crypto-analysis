import { useEffect } from "react";

interface ShortcutOptions {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    preventDefault?: boolean;
}

export const useKeyboardShortcut = (
    key: string,
    callback: () => void,
    options: ShortcutOptions = {}
) => {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== key.toLowerCase()) return;

            if (options.ctrlKey && !event.ctrlKey && !event.metaKey) return; // Allow metaKey for Mac Cmd support
            if (options.altKey && !event.altKey) return;
            if (options.shiftKey && !event.shiftKey) return;

            if (options.preventDefault) {
                event.preventDefault();
            }

            callback();
        };

        window.addEventListener("keydown", handler);

        return () => {
            window.removeEventListener("keydown", handler);
        };
    }, [key, callback, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.preventDefault]);
};
