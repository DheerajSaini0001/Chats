/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // The specific colors your component references:
                "chat-bubble-me": "#0891b2", // Neon Cyan (Cyan-600)
                "chat-bubble-friend": "rgba(255, 255, 255, 0.05)", // Ultra-transparent glass
            },
            boxShadow: {
                // Custom glows
                'neon-blue': '0 0 10px rgba(8, 145, 178, 0.5), 0 0 20px rgba(8, 145, 178, 0.3)',
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}