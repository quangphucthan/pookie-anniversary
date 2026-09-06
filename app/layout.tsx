import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
    subsets: ["latin", "vietnamese"],
    variable: "--font-lora",
    display: "swap",
});

export const metadata: Metadata = {
    title: "tôi yêu 36",
    robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={lora.variable}>
            <body>{children}</body>
        </html>
    );
}
