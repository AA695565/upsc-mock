import { TestInterface } from '@/components/TestInterface';
import { AuthProvider } from '@/components/AuthProvider';

export default function TestPage() {
  return (
    <AuthProvider>
      <TestInterface />
    </AuthProvider>
  );
}