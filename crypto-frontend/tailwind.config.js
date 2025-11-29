/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: "#0B0E11",
                    surface: "#161A1E",
                    border: "#2B2F36",
                    text: "#E4E8EB",
                    muted: "#71767B",
                },
                light: {
                    bg: "#F7F9FB",
                    surface: "#FFFFFF",
                    border: "#D1D4DC",
                    text: "#1A2332",
                    muted: "#6B7280",
                },
                primary: {
                    DEFAULT: "#00C9A7",
                    50: "#E6F9F6",
                    100: "#C0F0E8",
                    200: "#94E4D8",
                    300: "#66D6C6",
                    400: "#3DC7B3",
                    500: "#00C9A7",
                    600: "#00A389", // WCAG AA Large Text on White
                    700: "#007F6D", // WCAG AA Normal Text on White
                    800: "#005C50",
                    900: "#003B34",
                    950: "#001F1C",
                },
                bullish: "#00C9A7",
                bearish: "#FF4757",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
