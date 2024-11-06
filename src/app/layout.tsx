import "./globals.css";
import { ToastProvider } from '@/components/ui/toast-context';
import { DatabaseInitializer } from '@/components/DatabaseInitializer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <DatabaseInitializer />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
