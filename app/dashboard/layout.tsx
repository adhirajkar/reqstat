import Header from "@/components/core/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background h-screen text-foreground">
        <Header />
      {children}
    </div>
  );
}
