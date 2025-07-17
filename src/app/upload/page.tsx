import { FileUpload } from '@/components/FileUpload';
import { AuthProvider } from '@/components/AuthProvider';

export default function UploadPage() {
  return (
    <AuthProvider>
      <FileUpload />
    </AuthProvider>
  );
}