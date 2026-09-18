import { redirect } from "next/navigation";
import Album from "@/components/Album";
import Counter from "@/components/Counter";
import EmptyAlbum from "@/components/EmptyAlbum";
import Toolbar from "@/components/Toolbar";
import { CONFIG } from "@/config";
import { groupByMonth } from "@/lib/photos";
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

    // Pair each photo with its URL up front and drop the ones that didn't mint,
    // so no month section comes out short.
    const shots = photos.flatMap((photo) => {
        const url = urls.get(photo.path);
        return url ? [{ ...photo, url }] : [];
    });

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

            {shots.length === 0 ? <EmptyAlbum /> : <Album months={groupByMonth(shots)} />}

            <Toolbar />
        </main>
    );
}
