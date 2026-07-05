import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import DriveVerifier from "@/components/drive-verifier";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      <DriveVerifier />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col relative">
          {children}
        </main>
      </div>
    </div>
  );
}
