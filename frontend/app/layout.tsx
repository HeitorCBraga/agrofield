import "./globals.css";

export const metadata = {
  title: "AgroField",
  description: "Plataforma para produtores rurais",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
