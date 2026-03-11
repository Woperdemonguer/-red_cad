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
                cream: "#FAFAF5",
                sand: "#F0EDE4",
                border: "#EBE4D5",
                text: "#2D3748",
                textLight: "#718096",
                warmGray: "#7c7c72",
                accent: "#D4A843",
                red: "#C53030",
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
