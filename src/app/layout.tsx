import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduHub UG - Admin Panel",
  description: "Admin dashboard for managing EduHub UG educational content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
