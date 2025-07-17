import { Dashboard } from '@/components/Dashboard';
import { AuthProvider } from '@/components/AuthProvider';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}