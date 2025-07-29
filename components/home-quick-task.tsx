'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { QuickTaskDialog } from '@/components/quick-task-dialog';
import type { QuickTaskData } from '@/lib/supabase/quick-tasks';

interface HomeQuickTaskProps {
  onTaskCreated?: () => void;
}

export function HomeQuickTask({ onTaskCreated }: HomeQuickTaskProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTask = async (taskData: QuickTaskData) => {
    try {
      const response = await fetch('/api/quick-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to create task: ${errorData}`);
      }

      // タスク作成成功時の処理
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Error creating quick task:', error);
      throw error;
    }
  };

  return (
    <>
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-1" />
        予定追加
      </Button>
      
      <QuickTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </>
  );
}