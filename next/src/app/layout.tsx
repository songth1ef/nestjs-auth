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

interface RootLayoutProps {
  children: React.ReactNode;
}

// 由于Next.js 15.3.0改变了对params的处理方式，不再将其直接传递给layout组件
export default function RootLayout({ children }: RootLayoutProps) {
  // 在组件内部获取locale，而不是通过params参数获取
  // 默认使用中文
  const locale = "zh";
  
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
