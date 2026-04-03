import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  TrendingUp,
  Brain,
  Car,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Pacientes", path: "/pacientes", icon: Users },
    { label: "Agendamentos", path: "/agendamentos", icon: Calendar },
    { label: "CRM de Leads", path: "/crm", icon: TrendingUp },
    { label: "Assistente IA", path: "/assistente", icon: Brain },
    { label: "Modo Carro", path: "/carro", icon: Car },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r-2 border-green-500 border-dashed transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b-2 border-green-500 border-dashed">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-black">Dani</h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto hover:bg-green-50"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4 text-green-600" />
              ) : (
                <Menu className="w-4 h-4 text-green-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location === tab.path;
            return (
              <Button
                key={tab.path}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  !sidebarOpen && "justify-center px-0"
                } ${
                  isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "text-gray-700 hover:bg-green-50"
                }`}
                onClick={() => setLocation(tab.path)}
                title={!sidebarOpen ? tab.label : ""}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-green-600" : "text-green-500"}`} />
                {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-2 border-green-500 border-dashed space-y-3">
          {sidebarOpen && (
            <div className="text-xs text-gray-700">
              <p className="font-bold text-black">DC</p>
              <p className="font-semibold">Dra. Daniela Coelho</p>
              <p className="text-gray-600">CRP 06/123456-SP</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-green-500 text-green-700 hover:bg-green-50"
            onClick={() => {}}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Sair"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Top Bar */}
        <div className="border-b-2 border-green-500 border-dashed bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">
            {tabs.find((t) => t.path === location)?.label || "Dashboard"}
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="relative border-green-500 text-green-700 hover:bg-green-50"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              10
            </span>
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
