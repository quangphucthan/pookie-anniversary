// Shown until the first photo lands. Inline rather than a file in /public so the
// strokes can read from the palette in globals.css and stay in key with the
// rest of the page.
export default function EmptyAlbum() {
    return (
        <div className="empty">
            <svg viewBox="0 0 120 112" aria-hidden="true" focusable="false">
                <g transform="rotate(-6 60 66)">
                    <rect
                        x="24"
                        y="30"
                        width="72"
                        height="72"
                        rx="6"
                        fill="#fff"
                        stroke="var(--line)"
                        strokeWidth="2"
                    />
                    <rect
                        x="32"
                        y="38"
                        width="56"
                        height="42"
                        rx="3"
                        fill="#fdeef0"
                        stroke="var(--line)"
                        strokeWidth="1.5"
                    />
                    <circle cx="73" cy="50" r="5" fill="var(--line)" />
                    <path d="M35 79 L50 59 L62 72 L70 64 L85 79 Z" fill="var(--line)" />
                </g>
                <path
                    transform="translate(80 4) scale(0.5)"
                    d="M14 26 C14 26 0 17 0 8 C0 3 4 0 8 0 C11 0 13 2 14 4 C15 2 17 0 20 0 C24 0 28 3 28 8 C28 17 14 26 14 26 Z"
                    fill="var(--accent)"
                    opacity="0.85"
                />
            </svg>
            <p>Chưa có hình loz ơi</p>
            <p className="hint">Bấm “Up hình đuy” ở dưới là lên ngay con ảnh</p>
        </div>
    );
}
