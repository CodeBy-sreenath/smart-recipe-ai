import "./globals.css";

export const metadata = {
  title: "Smart Recipe Generator | AI-Powered Kitchen",
  description: "Upload a photo, speak your pantry, or pick ingredients — get instant AI-generated recipes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}