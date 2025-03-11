import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HealSync - Blockchain Organ Donation Platform',
  description: 'A secure, transparent, and decentralized organ donation platform powered by Web3.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {/* Navbar */}
        <nav className="bg-gray-800/90 backdrop-blur-md fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-400">HealSync</h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    About
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Donate
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800/90 backdrop-blur-md mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-300">
              <p>© 2023 HealSync. All rights reserved.</p>
              <p className="mt-2 text-sm">
                Built using <span className="text-blue-400">Next.js</span> & <span className="text-blue-400">Blockchain</span>.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}