/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                forest: "#2E5339",
                forestLight: "#3c6b4a",
                sage: "#8BAA7C",
                cream: "#FFFFFF",
                sand: "#F5F7FA",
                border: "#E2E8F0",
                text: "#1A202C",
                textLight: "#718096",
                warmGray: "#A0AEC0",
                accent: "#E8A923",
                accentHover: "#D49A1A",
                accentLight: "#FEF3D1",
                red: "#C53030",
                blueBg: "#D6E4F0",
                blueBgLight: "#EBF0F7",
            },
            fontFamily: {
                sans: ["'Nunito'", "sans-serif"],
                serif: ["'Nunito'", "sans-serif"],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
};
