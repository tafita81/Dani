import { useEffect, useState } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop" | "laptop";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

/**
 * Hook para detectar tipo de dispositivo
 * Breakpoints:
 * - Mobile: < 640px (iPhone, Android)
 * - Tablet: 640px - 1024px (iPad, tablets)
 * - Desktop: 1024px - 1440px (Desktop, small laptop)
 * - Laptop: >= 1440px (Large laptop, desktop)
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else if (width < 1440) {
        setDeviceType("desktop");
      } else {
        setDeviceType("laptop");
      }
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  return deviceType;
}

/**
 * Hook para detectar orientação do dispositivo
 */
export function useDeviceOrientation(): "portrait" | "landscape" {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("resize", updateOrientation);
    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Componente responsivo que se auto-ajusta para todos os dispositivos
 */
export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const deviceType = useDeviceType();
  const orientation = useDeviceOrientation();

  // Viewport meta tags já configuradas em index.html
  // Aqui apenas garantimos que o layout se ajusta corretamente

  return (
    <div
      className={`w-full h-screen overflow-hidden bg-background text-foreground
        ${deviceType === "mobile" ? "text-sm" : ""}
        ${deviceType === "tablet" ? "text-base" : ""}
        ${deviceType === "desktop" ? "text-base" : ""}
        ${deviceType === "laptop" ? "text-lg" : ""}
        ${orientation === "landscape" && deviceType === "mobile" ? "h-auto" : ""}
      `}
      data-device={deviceType}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
}

/**
 * Componente para mostrar/esconder conteúdo baseado no tipo de dispositivo
 */
interface ResponsiveProps {
  children: React.ReactNode;
  show?: DeviceType | DeviceType[];
  hide?: DeviceType | DeviceType[];
}

export function ShowOnDevice({ children, show, hide }: ResponsiveProps) {
  const deviceType = useDeviceType();

  const showArray = Array.isArray(show) ? show : show ? [show] : [];
  const hideArray = Array.isArray(hide) ? hide : hide ? [hide] : [];

  const shouldShow =
    (showArray.length === 0 || showArray.includes(deviceType)) &&
    (hideArray.length === 0 || !hideArray.includes(deviceType));

  return shouldShow ? <>{children}</> : null;
}

/**
 * Componente para layout responsivo com sidebar colapsável
 */
interface ResponsiveSidebarProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function ResponsiveSidebarLayout({ sidebar, children }: ResponsiveSidebarProps) {
  const deviceType = useDeviceType();
  const [sidebarOpen, setSidebarOpen] = useState(deviceType !== "mobile" && deviceType !== "tablet");

  useEffect(() => {
    // Fechar sidebar automaticamente em mobile
    if (deviceType === "mobile") {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [deviceType]);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-0"}
          ${deviceType === "mobile" ? "fixed z-50 h-screen" : "relative"}
          ${deviceType === "tablet" ? "w-48" : ""}
          ${deviceType === "laptop" ? "w-72" : ""}
          overflow-hidden bg-card border-r border-border
        `}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-between p-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-md"
          >
            ☰
          </button>
        </div>
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && deviceType === "mobile" && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Componente para grid responsivo
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    laptop?: number;
  };
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3, laptop: 4 },
}: ResponsiveGridProps) {
  const deviceType = useDeviceType();

  const colCount = columns[deviceType] || 1;

  return (
    <div
      className="grid gap-4 w-full"
      style={{
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
