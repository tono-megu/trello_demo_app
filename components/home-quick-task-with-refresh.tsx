'use client';

import { useRouter } from 'next/navigation';
import { HomeQuickTask } from '@/components/home-quick-task';

export function HomeQuickTaskWithRefresh() {
  const router = useRouter();

  const handleTaskCreated = () => {
    // ページを再読み込みして最新のタスクを取得
    router.refresh();
  };

  return <HomeQuickTask onTaskCreated={handleTaskCreated} />;
}