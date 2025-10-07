/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./index.js", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#1E88E5",
                warning: "#E53935",
                success: "#43A047",
                background: "#F5F5F5",
                txt1: "#212121",
                txt2: "#616161",
                alert: "#FFB300",
                neutral50: '#fafafa',
                neutral100: '#f5f5f5',
                neutral200: '#e5e5e5',
                neutral300: '#d4d4d4',
                neutral350: '#CCCCCC',
                neutral400: '#a3a3a3',
                neutral500: '#737373',
                neutral600: '#525252',
                neutral700: '#404040',
                neutral800: '#262626',
                neutral900: '#171717'
            },
        },
    },
    plugins: [],
}
