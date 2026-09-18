"use client";

import { useSyncExternalStore } from "react";
import { daysSince } from "@/lib/days";

const pad = (n: number) => String(n).padStart(2, "0");

// One clock for the page. getSnapshot has to return a *cached* value -- handing
// back a fresh Date.now() every render makes React re-render forever.
let tick = Date.now();
const subscribe = (onChange: () => void) => {
    const id = setInterval(() => {
        tick = Date.now();
        onChange();
    }, 1000);
    return () => clearInterval(id);
};

export default function Counter({ since }: { since: string }) {
    const start = new Date(since);
    // null on the server and during hydration -- the clock only exists in the
    // browser, and React swaps in the real value on the first client render.
    const now = useSyncExternalStore(
        subscribe,
        () => tick,
        () => null,
    );
    const ms = now === null ? 0 : now - start.getTime();

    return (
        <>
            <p className="sub">
                hình như là từ ngày{" "}
                {start.toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}{" "}
                <span className="heart">♥</span>
            </p>
            <p className="count">
                {now === null ? "—" : daysSince(start, new Date(now)).toLocaleString()}
                <small>chà bá cỡ nhiêu đây ngày</small>
            </p>
            <p className="clock">
                {now === null
                    ? "\u00a0"
                    : `${pad(Math.floor(ms / 3_600_000) % 24)}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)} và còn dài lắm`}
            </p>
        </>
    );
}
