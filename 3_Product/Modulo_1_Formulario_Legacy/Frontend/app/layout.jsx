import "./globals.css";

export const metadata = {
    title: "RedCAD Hub - Intranet",
    description: "Sistema nervioso digital de la Red Estatal de CAD",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
