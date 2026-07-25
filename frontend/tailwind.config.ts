import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'zdc-void': '#0A0C11',
        'zdc-panel': '#12151D',
        'zdc-signal': '#29E8C8',
        'zdc-flat': '#FF5C7A',
        'zdc-pending': '#F5A623',
        'zdc-depth': '#6C5CE7',
        'zdc-text': '#E8EAF0',
        'zdc-muted': '#7A8194',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        'mono-data': ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'zdc': '12px',
        'zdc-sm': '8px',
      },
    },
  },
  plugins: [],
};
export default config;
