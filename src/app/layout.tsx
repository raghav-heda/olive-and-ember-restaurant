import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Olive & Ember Kitchen | Artisanal Wood-Fired Gastronomy",
  description:
    "An intimate dining destination in Indiranagar, Bengaluru. Slow-fermented sourdough pizzas, charred hearth-cooked mains, handcrafted pastas, and botanical elixirs.",
  keywords: [
    "restaurant",
    "wood-fired pizza",
    "bengaluru dining",
    "artisanal hearth",
    "table reservations",
    "olive and ember",
  ],
  authors: [{ name: "Olive & Ember Kitchen" }],
  openGraph: {
    title: "Olive & Ember Kitchen | Artisanal Wood-Fired Gastronomy",
    description:
      "Wood-fired slow-fermented pizzas, handmade bronze-cut pastas, and hearthside coastal dining.",
    url: "https://oliveandember.demo",
    siteName: "Olive & Ember Kitchen",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Olive & Ember Dining Room",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen bg-ivory-50 text-charcoal-900 selection:bg-terracotta-100 selection:text-terracotta-800">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
