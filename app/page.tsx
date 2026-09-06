import Image from "next/image";
import { redirect } from "next/navigation";
import Counter from "@/components/Counter";
import Toolbar from "@/components/Toolbar";
import { CONFIG } from "@/config";
import { createClient } from "@/lib/supabase/server";

type Photo = { id: string; path: string; caption: string | null; taken_on: string | null };

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

            {photos.length === 0 ? (
                <p className="empty">Chưa có hình loz ơi.</p>
            ) : (
                <div className="gallery">
                    {photos.map((photo) => {
                        const url = urls.get(photo.path);
                        if (!url) return null;
                        return (
                            <figure key={photo.id}>
                                <div className="shot">
                                    <Image
                                        src={url}
                                        alt={photo.caption ?? ""}
                                        fill
                                        sizes="(max-width: 34rem) 50vw, 11rem"
                                    />
                                </div>
                                {photo.caption && <figcaption>{photo.caption}</figcaption>}
                            </figure>
                        );
                    })}
                </div>
            )}

            <Toolbar />
        </main>
    );
}
