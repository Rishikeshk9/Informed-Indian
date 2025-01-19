import './globals.css';
import { Sidebar } from '../components/sidebar';

export const metadata = {
  title: 'Admin Panel',
  description: 'Manage your app data',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='bg-gray-50'>
        <div className='flex h-screen'>
          <Sidebar />
          <div className='flex-1 overflow-auto transition-all duration-300'>
            <main className='p-8'>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
