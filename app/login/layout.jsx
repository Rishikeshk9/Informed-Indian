import { Toaster } from 'react-hot-toast';

export default function LoginLayout({ children }) {
  return (
    <div>
      {children}
      <Toaster position='top-right' />
    </div>
  );
}
