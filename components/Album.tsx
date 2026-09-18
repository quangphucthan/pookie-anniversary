"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { PhotoGroup } from "@/lib/photos";

type Shot = { id: string; url: string; caption: string | null };

const PER_PAGE = 9; // 3 x 3
// A row is 3 tiles and any of them can be the LCP -- so eager, not preload.
const EAGER_TILES = 3;
// Tiles fade in one after another. Past this the tail would spend longer waiting
// on its delay than actually animating, which just reads as lag.
const MAX_STAGGER = 7;

const Chevron = ({ flip = false }: { flip?: boolean }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            d={flip ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// One month at a time, nine tiles a page. Client state rather than the URL:
// every server render costs two Supabase round trips (proxy + page), which is
// too slow for "tap a month".
export default function Album({ months }: { readonly months: readonly PhotoGroup<Shot>[] }) {
    const [picked, setPicked] = useState(months[0].key);
    const [page, setPage] = useState(0);

    // A router.refresh() after upload swaps the props but keeps this state, so
    // the picked month can be gone and the page can be past the end. Clamp both.
    const month = months.find((m) => m.key === picked) ?? months[0];
    const pages = Math.ceil(month.photos.length / PER_PAGE);
    const at = Math.min(page, pages - 1);
    const shown = month.photos.slice(at * PER_PAGE, (at + 1) * PER_PAGE);

    return (
        <section className="month">
            <select
                className="months"
                aria-label="Tháng"
                value={month.key}
                onChange={(e) => {
                    setPicked(e.target.value);
                    setPage(0);
                }}
            >
                {months.map((m) => (
                    <option key={m.key} value={m.key}>
                        {m.label}
                    </option>
                ))}
            </select>

            <div className="gallery">
                {shown.map((shot, i) => (
                    <figure
                        key={shot.id}
                        style={{ "--i": Math.min(i, MAX_STAGGER) } as CSSProperties}
                    >
                        <div className="shot">
                            <Image
                                src={shot.url}
                                alt={shot.caption ?? ""}
                                fill
                                sizes="(max-width: 34rem) 33vw, 11rem"
                                loading={i < EAGER_TILES ? "eager" : "lazy"}
                            />
                        </div>
                        {shot.caption && <figcaption>{shot.caption}</figcaption>}
                    </figure>
                ))}
            </div>

            {pages > 1 && (
                <div className="pager">
                    <button
                        type="button"
                        className="chevron"
                        aria-label="Trang trước"
                        disabled={at === 0}
                        onClick={() => setPage(at - 1)}
                    >
                        <Chevron />
                    </button>
                    <span className="dots" aria-hidden="true">
                        {Array.from({ length: pages }, (_, i) => (
                            <i key={i} aria-current={i === at ? "true" : undefined} />
                        ))}
                    </span>
                    <button
                        type="button"
                        className="chevron"
                        aria-label="Trang sau"
                        disabled={at === pages - 1}
                        onClick={() => setPage(at + 1)}
                    >
                        <Chevron flip />
                    </button>
                </div>
            )}
        </section>
    );
}
