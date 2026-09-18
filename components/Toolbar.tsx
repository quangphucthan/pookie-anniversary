"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { localDate } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 15 * 1024 * 1024;

// done counts files finished, failures included, so the bar always fills.
type Progress = { done: number; total: number };

const label = ({ done, total }: Progress) =>
    total > 1 ? `Đang up ${Math.min(done + 1, total)}/${total}…` : "Đang up…";

export default function Toolbar() {
    const router = useRouter();
    const supabase = createClient();
    const [progress, setProgress] = useState<Progress | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    async function upload(files: FileList | null) {
        // Copy the FileList before the first await: the input is cleared the moment
        // this returns, and a FileList is a live view onto it.
        const picked = files ? Array.from(files) : [];
        if (!picked.length) return;

        setErrors([]);
        setProgress({ done: 0, total: picked.length });

        // Once for the batch, not once per file.
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setProgress(null);
            return router.push("/login");
        }

        // Collected rather than assigned: pick ten photos with three bad ones and
        // you want all three named, not whichever failed last.
        const failed: string[] = [];
        let done = 0;
        const step = () => setProgress({ done: ++done, total: picked.length });

        for (const file of picked) {
            if (!file.type.startsWith("image/")) {
                failed.push(`${file.name} hong phải hình`);
                step();
                continue;
            }
            if (file.size > MAX_BYTES) {
                failed.push(`${file.name} nặng hơn 15MB rồi`);
                step();
                continue;
            }

            // Straight to storage from the browser: a Vercel function would choke on
            // anything over ~4.5MB, which is most phone photos.
            const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
            const { error: upErr } = await supabase.storage.from("photos").upload(path, file);
            if (upErr) {
                failed.push(`${file.name}: ${upErr.message}`);
                step();
                continue;
            }

            const { error: rowErr } = await supabase
                .from("photos")
                .insert({ path, taken_on: localDate(file.lastModified) });
            if (rowErr) failed.push(`${file.name}: ${rowErr.message}`);
            step();
        }

        setProgress(null);
        setErrors(failed);
        router.refresh();
    }

    return (
        <>
            <div className="bar">
                <label className="btn">
                    {progress ? label(progress) : "Up hình đuy"}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={progress !== null}
                        onChange={(e) => {
                            upload(e.target.files);
                            // Clear it, or picking the same photo twice in a row is a
                            // no-op -- the value never changes, so onChange never fires.
                            e.target.value = "";
                        }}
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
            {progress && (
                <div
                    className="progress"
                    role="progressbar"
                    aria-label="Đang up hình"
                    aria-valuemin={0}
                    aria-valuemax={progress.total}
                    aria-valuenow={progress.done}
                >
                    <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                </div>
            )}
            {errors.map((message) => (
                <p className="error" key={message}>
                    {message}
                </p>
            ))}
        </>
    );
}
