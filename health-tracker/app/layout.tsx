import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from '../components/AppShell';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Tracker",
  description: "Personal health, nutrition, and workout tracking application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 relative`}
      >
        {/* background*/}
        <div className="fixed inset-0 z-[-1] pointer-events-none w-full h-full bg-neutral-950">
          <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-neutral-800/10 to-transparent" />

          <div className="absolute inset-0 bg-[radial-gradient(#303030_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.25] [mask-image:linear-gradient(to_bottom,#FFF,transparent)]" />
        </div>

        <main className="flex-1 w-full max-w-md mx-auto relative z-0">
          <AppShell>{children}</AppShell>
        </main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#171717',
              color: '#ededed',
              border: '1px solid #262626',
              borderRadius: '1rem',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#34d399',
                secondary: '#171717',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
