import Image from "next/image";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import Counter from "@/components/Counter";
import EmptyAlbum from "@/components/EmptyAlbum";
import Toolbar from "@/components/Toolbar";
import { CONFIG } from "@/config";
import { groupByMonth } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

type Photo = { id: string; path: string; caption: string | null; taken_on: string | null };

// ponytail: a row is 2 tiles on mobile, 3 on desktop, and any of them can be the
// LCP -- so eager, not preload. Bump if the grid ever gets wider than 34rem.
const EAGER_TILES = 3;
// Tiles fade in one after another. Past this the tail of a fat month would spend
// longer waiting on its delay than actually animating, which just reads as lag.
const MAX_STAGGER = 7;

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data } = await supabase
        .from("photos")
        .select("id, path, caption, taken_on")
        .order("taken_on", { ascending: false, nullsFirst: false });
    const photos = (data ?? []) as Photo[];

    // Private bucket, so every render mints short-lived signed URLs. One call for
    // the whole page, not one per photo.
    const { data: signed } = photos.length
            ? await supabase.storage.from("photos").createSignedUrls(
                photos.map((p) => p.path),
                3600,
            )
        : { data: [] };
    const urls = new Map(signed?.map((s) => [s.path, s.signedUrl]) ?? []);

    // Pair each photo with its URL up front and drop the ones that didn't mint.
    // Bailing out mid-render instead would let a month section come out empty and
    // would spend the eager-loading window below on tiles that never appear.
    const shots = photos.flatMap((photo) => {
        const url = urls.get(photo.path);
        return url ? [{ ...photo, url }] : [];
    });
    const eager = new Set(shots.slice(0, EAGER_TILES).map((shot) => shot.path));

    return (
        <main>
            <h1>{CONFIG.title}</h1>
            <Counter since={CONFIG.since} />

            <div className="letter">
                {CONFIG.letter.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                ))}
                <p className="sign">{CONFIG.signature}</p>
            </div>

            {shots.length === 0 ? (
                <EmptyAlbum />
            ) : (
                groupByMonth(shots).map((month) => (
                    <section className="month" key={month.key}>
                        <h2>{month.label}</h2>
                        <div className="gallery">
                            {month.photos.map((shot, i) => (
                                <figure
                                    key={shot.id}
                                    style={{ "--i": Math.min(i, MAX_STAGGER) } as CSSProperties}
                                >
                                    <div className="shot">
                                        <Image
                                            src={shot.url}
                                            alt={shot.caption ?? ""}
                                            fill
                                            sizes="(max-width: 34rem) 50vw, 11rem"
                                            loading={eager.has(shot.path) ? "eager" : "lazy"}
                                        />
                                    </div>
                                    {shot.caption && <figcaption>{shot.caption}</figcaption>}
                                </figure>
                            ))}
                        </div>
                    </section>
                ))
            )}

            <Toolbar />
        </main>
    );
}
