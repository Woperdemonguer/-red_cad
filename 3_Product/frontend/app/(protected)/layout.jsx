import DashboardLayout from "../../components/DashboardLayout";
import ErrorBoundary from "../../components/ErrorBoundary";

export default function ProtectedLayout({ children }) {
    return (
        <DashboardLayout>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </DashboardLayout>
    );
}
