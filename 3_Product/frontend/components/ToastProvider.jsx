"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: { background: '#363636', color: '#fff', fontSize: '14px', borderRadius: '10px' },
                success: { duration: 3000, theme: { primary: '#2F4F4F', secondary: 'white' } },
            }}
        />
    );
}
