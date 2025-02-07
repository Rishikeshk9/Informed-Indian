import { Sidebar } from '../../components/sidebar';
import AuthGuard from '../../components/auth/AuthGuard';
import { Toaster } from 'react-hot-toast';

export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <div className='flex h-screen'>
        <Sidebar />
        <div className='flex-1 overflow-auto transition-all duration-300'>
          <main className='p-8'>{children}</main>
        </div>
      </div>
      <Toaster position='top-right' />
    </AuthGuard>
  );
}
