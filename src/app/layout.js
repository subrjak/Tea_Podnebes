import './globals.css';
import '@/shared/styles/index.css';
import '@/shared/ui/Header.css';
import '@/shared/ui/TeaCard.css';
import '../features/home/pages/HomePage.css';
import Providers from './providers';
import Header from '@/shared/ui/Header';
import Footer from '@/shared/ui/Footer';

export const metadata = {
  title: 'Лист Поднебесной — китайский чай',
  description: 'Магазин китайского чая, чайной посуды и церемоний.',
  icons: { icon: '/favicon.jpg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="app-wrapper">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
