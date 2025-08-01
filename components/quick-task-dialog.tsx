'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { MultiUserSelector } from '@/components/multi-user-selector';
import { Plus, Sparkles, X, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QuickTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: {
    title: string;
    due_date?: string;
    due_time?: string;
    assigned_user_ids?: string[];
  }) => Promise<void>;
}

export function QuickTaskDialog({ isOpen, onClose, onCreateTask }: QuickTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState<string | undefined>();
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onCreateTask({
        title: title.trim(),
        due_date: dueDate ? dueDate.toISOString() : undefined,
        due_time: dueTime,
        assigned_user_ids: assignedUserIds.length > 0 ? assignedUserIds : undefined,
      });
      
      // フォームをリセット
      setTitle('');
      setDueDate(undefined);
      setDueTime(undefined);
      setAssignedUserIds([]);
      onClose();
    } catch (error) {
      console.error('Failed to create quick task:', error);
      alert('タスクの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDueDate(undefined);
    setDueTime(undefined);
    setAssignedUserIds([]);
    onClose();
  };

  // 今日、明日、今週末のクイック選択
  const quickDateOptions = [
    {
      label: '今日',
      date: new Date(),
      icon: '📅'
    },
    {
      label: '明日', 
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      icon: '⏰'
    },
    {
      label: '今週末',
      date: (() => {
        const date = new Date();
        const day = date.getDay();
        const daysToFriday = day <= 5 ? 5 - day : 7 - day + 5;
        return new Date(Date.now() + daysToFriday * 24 * 60 * 60 * 1000);
      })(),
      icon: '🎯'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              クイックタスク作成
            </DialogTitle>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          <DialogDescription className="text-gray-600 text-base">
            🚀 サクッとタスクを作成して、すぐに作業を開始しましょう！
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {/* タスクタイトル */}
          <div className="grid gap-3">
            <Label htmlFor="quickTitle" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              📝 タスク名
            </Label>
            <Input
              id="quickTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="やることを入力..."
              className="border-2 border-green-200 focus:border-green-400 rounded-xl bg-white/80 p-3 text-base"
              autoFocus
            />
          </div>

          {/* クイック日付選択 */}
          <div className="grid gap-3">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              ⚡ クイック設定
            </Label>
            <div className="flex gap-2">
              {quickDateOptions.map((option) => (
                <Button
                  key={option.label}
                  variant={dueDate?.toDateString() === option.date.toDateString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDueDate(option.date)}
                  className="flex-1 text-xs"
                >
                  {option.icon} {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 詳細な日付選択 */}
          <div className="grid gap-3">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              📅 納期（詳細）
            </Label>
            <DatePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="📅 納期を選択..."
              className="border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-white/80 p-3"
            />
          </div>

          {/* 時間選択 */}
          <div className="grid gap-3">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              🕐 時間
            </Label>
            <TimePicker
              time={dueTime}
              onTimeChange={setDueTime}
              placeholder="🕐 時間を選択..."
              className="border-2 border-purple-200 focus:border-purple-400 rounded-xl bg-white/80 p-3"
            />
          </div>

          {/* 担当者選択 */}
          <div className="grid gap-3">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              👤 担当者
            </Label>
            <MultiUserSelector
              selectedUserIds={assignedUserIds}
              onUsersSelect={setAssignedUserIds}
              placeholder="👤 担当者を選択..."
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 px-6 py-2"
          >
            <X className="h-4 w-4 mr-2" />
            キャンセル
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim() || isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLoading ? '作成中...' : '🚀 作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}