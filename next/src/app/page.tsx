'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // 检查是否已登录
    const isAuthenticated = localStorage.getItem("auth") === "true";
    
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">正在跳转...</p>
    </div>
  );
}
