import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from '@/components/providers/I18nProvider'
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "认证系统",
  description: "基于 Next.js 和 NestJS 的认证系统",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const locale = params.locale || "zh";
  
  return (
    <html lang={locale}>
      <head>
        <Script id="hide-logs" strategy="beforeInteractive">
          {`
            // 隐藏 Fast Refresh 日志
            const originalConsoleLog = console.log;
            console.log = function() {
              if (
                typeof arguments[0] === 'string' && 
                (arguments[0].includes('[Fast Refresh]') || 
                arguments[0].includes('Maximum update depth exceeded'))
              ) {
                return;
              }
              originalConsoleLog.apply(console, arguments);
            };
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <I18nProvider locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
