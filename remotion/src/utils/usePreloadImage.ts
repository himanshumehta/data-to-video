import { useEffect } from "react";
import { delayRender, continueRender } from "remotion";
import { resolveImage } from "./resolveImage";

/**
 * Preload an image URL before Remotion renders any frame.
 * Uses delayRender/continueRender so frame 0 always has the image ready.
 * Works in both @remotion/player (preview) and renderMedia (batch).
 */
export function usePreloadImage(url: string | undefined) {
  useEffect(() => {
    const src = resolveImage(url);
    if (!src) return;

    const handle = delayRender(`Preloading image: ${src.slice(0, 60)}...`);
    const img = new Image();
    img.onload = () => continueRender(handle);
    img.onerror = () => continueRender(handle); // don't block forever on error
    img.src = src;

    return () => {
      // cleanup: if component unmounts before load, continue render
      try { continueRender(handle); } catch {}
    };
  }, [url]);
}
