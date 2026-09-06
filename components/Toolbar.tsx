"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 15 * 1024 * 1024;

export default function Toolbar() {
    const router = useRouter();
    const supabase = createClient();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function upload(files: FileList | null) {
        if (!files?.length) return;
        setBusy(true);
        setError(null);

        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) {
                setError(`${file.name} isn't an image`);
                continue;
            }
            if (file.size > MAX_BYTES) {
                setError(`${file.name} is over 15MB`);
                continue;
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return router.push("/login");

            // Straight to storage from the browser: a Vercel function would choke on
            // anything over ~4.5MB, which is most phone photos.
            const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
            const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
            if (upErr) {
                setError(upErr.message);
                continue;
            }

            const { error: rowErr } = await supabase
                .from("photos")
                .insert({ path, taken_on: new Date(file.lastModified).toISOString().slice(0, 10) });
            if (rowErr) setError(rowErr.message);
        }

        setBusy(false);
        router.refresh();
    }

    return (
        <>
            <div className="bar">
                <label className="btn">
                    {busy ? "Uploading…" : "Up hình đuy"}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={busy}
                        onChange={(e) => upload(e.target.files)}
                    />
                </label>
                <button
                    type="button"
                    className="link"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/login");
                    }}
                >
                    Lóg out
                </button>
            </div>
            {error && <p className="error">{error}</p>}
        </>
    );
}
