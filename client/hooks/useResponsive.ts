import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

interface ResponsiveInfo {
  device: DeviceType;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const [responsiveInfo, setResponsiveInfo] = useState<ResponsiveInfo>({
    device: "desktop",
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let device: DeviceType;
      if (width < 768) {
        device = "mobile";
      } else if (width < 1024) {
        device = "tablet";
      } else {
        device = "desktop";
      }

      setResponsiveInfo({
        device,
        width,
        height,
        isMobile: device === "mobile",
        isTablet: device === "tablet",
        isDesktop: device === "desktop",
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return responsiveInfo;
}
