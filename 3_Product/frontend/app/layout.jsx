import "./globals.css";
import ToastProvider from '@/components/ToastProvider';

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
                <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ToastProvider />
                {children}
            </body>
        </html>
    );
}
