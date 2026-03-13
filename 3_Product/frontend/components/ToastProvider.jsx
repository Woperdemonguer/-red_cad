"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: { background: '#1A202C', color: '#fff', fontSize: '14px', borderRadius: '10px' },
                success: { duration: 3000, style: { background: '#2E5339', color: '#fff' } },
                error: { duration: 4000, style: { background: '#C53030', color: '#fff' } },
            }}
        />
    );
}
