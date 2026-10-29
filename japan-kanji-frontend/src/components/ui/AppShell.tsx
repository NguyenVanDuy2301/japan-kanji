import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[var(--color-paper-2)] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden pb-16 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
