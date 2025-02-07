import './globals.css';

export const metadata = {
  title: 'Admin Panel',
  description: 'Manage your app data',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='bg-gray-50'>{children}</body>
    </html>
  );
}
