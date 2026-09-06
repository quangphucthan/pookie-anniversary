"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // onSubmit, not action={}: a React 19 form action resets the form when it
    // finishes, so a mistyped password would wipe the email field too.
    async function signIn(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError(null);
        const { error } = await createClient().auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) return setError(error.message);
        router.replace("/");
        router.refresh();
    }

    return (
        <form className="login" onSubmit={signIn}>
            <h1>Helo Bi Fat :D</h1>
            <input
                type="email"
                placeholder="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={busy}>
                {busy ? "…" : "Vào đê!"}
            </button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}
