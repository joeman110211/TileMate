import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tilemate.app",
  appName: "TileMate",
  webDir: "dist",
  server: {
    url: "tile-mate-armq1mps0-joe-cfc4.vercel.app",
    cleartext: false,
  },
};

export default config;
