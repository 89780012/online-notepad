import { redirect } from 'next/navigation';

interface SharePageProps {
  params: Promise<{ token: string }>;
}

// 处理无语言前缀的分享链接，重定向到默认语言版本
export default async function SharePageWithoutLocale({ params }: SharePageProps) {
  const { token } = await params;
  
  // 重定向到默认语言版本的分享页面
  redirect(`/en/share/${token}`);
}