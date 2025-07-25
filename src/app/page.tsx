import { AuthProvider } from '@/components/AuthProvider';
import { LoginForm } from '@/components/LoginForm';

export default function Home() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}