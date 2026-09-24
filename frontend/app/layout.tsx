export const metadata = {
  title: "AgroField",
  description: "Plataforma para produtores rurais",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
