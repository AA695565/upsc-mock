import { ResultsPage } from '@/components/ResultsPage';
import { AuthProvider } from '@/components/AuthProvider';

export default function Results() {
  return (
    <AuthProvider>
      <ResultsPage />
    </AuthProvider>
  );
}