import type { Metadata } from "next";
import { APP_FULL_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_FULL_NAME,
    template: `%s · ${APP_FULL_NAME}`,
  },
  description:
    "Threat actor investigation and relationship analysis system",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
