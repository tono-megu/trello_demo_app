'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { MultiUserSelector } from '@/components/multi-user-selector';
import { FileText, Sparkles, Save, X, MoveHorizontal } from 'lucide-react';
import { KanbanAPI } from '@/lib/supabase/kanban';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TaskCard } from '@/lib/supabase/tasks';
import type { Board, List } from '@/lib/types/kanban';

interface HomeTaskEditDialogProps {
  task: TaskCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: { title?: string; description?: string; due_date?: string; due_time?: string; assigned_user_ids?: string[] }) => void;
  onMoveToBoard?: (taskId: string, targetListId: string) => void;
}

export function HomeTaskEditDialog({ task, isOpen, onClose, onSave, onMoveToBoard }: HomeTaskEditDialogProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  );
  const [dueTime, setDueTime] = useState(task?.due_time || '');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    task?.assigned_users?.map(user => user.id) || []
  );
  
  // ボード移動関連の状態
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [showMoveSection, setShowMoveSection] = useState(false);

  // ボード一覧を取得
  useEffect(() => {
    const loadBoards = async () => {
      if (isOpen) {
        try {
          const kanbanAPI = new KanbanAPI();
          const boardsData = await kanbanAPI.getBoards();
          setBoards(boardsData);
          setSelectedBoardId(task?.board_id || '');
        } catch (error) {
          console.error('Failed to load boards:', error);
        }
      }
    };
    loadBoards();
  }, [isOpen, task?.board_id]);

  // 選択されたボードのリスト一覧を取得
  useEffect(() => {
    const loadLists = async () => {
      if (selectedBoardId) {
        try {
          const kanbanAPI = new KanbanAPI();
          const listsData = await kanbanAPI.getBoardLists(selectedBoardId);
          setLists(listsData);
          // 現在のボードを選択している場合は、現在のリストを選択
          if (selectedBoardId === task?.board_id) {
            setSelectedListId(task?.list_id || '');
          } else {
            setSelectedListId('');
          }
        } catch (error) {
          console.error('Failed to load lists:', error);
        }
      }
    };
    loadLists();
  }, [selectedBoardId, task?.board_id, task?.list_id]);

  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setDueTime(task.due_time || '');
      setAssignedUserIds(task.assigned_users?.map(user => user.id) || []);
    }
  }, [task]);

  const handleSave = () => {
    if (task && title.trim()) {
      onSave(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate ? dueDate.toISOString() : undefined,
        due_time: dueTime || undefined,
        assigned_user_ids: assignedUserIds,
      });
      onClose();
    }
  };

  const handleMoveCard = () => {
    if (task && selectedListId && onMoveToBoard) {
      onMoveToBoard(task.id, selectedListId);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setDueTime(task.due_time || '');
      setAssignedUserIds(task.assigned_users?.map(user => user.id) || []);
    }
    // 移動セクション関連をリセット
    setShowMoveSection(false);
    setSelectedBoardId(task?.board_id || '');
    setSelectedListId('');
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              タスク編集
            </DialogTitle>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          <DialogDescription className="text-gray-600 text-base">
            📝 タスクの詳細を編集して、より効率的に管理しましょう！
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-3 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              🏷️ タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトルを入力..."
              className="border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-white/80 p-3 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              📝 説明
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="📄 タスクの詳細を説明..."
              rows={4}
              className="border-2 border-purple-200 focus:border-purple-400 rounded-xl bg-white/80 p-3 text-base resize-none"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              📅 納期
            </Label>
            <DatePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="📅 納期を選択..."
              className="border-2 border-green-200 focus:border-green-400 rounded-xl bg-white/80 p-3"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              🕐 時間
            </Label>
            <TimePicker
              time={dueTime}
              onTimeChange={(time) => setDueTime(time || '')}
              placeholder="🕐 時間を選択..."
              className="border-2 border-pink-200 focus:border-pink-400 rounded-xl bg-white/80 p-3"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              👤 担当者
            </Label>
            <MultiUserSelector
              selectedUserIds={assignedUserIds}
              onUsersSelect={setAssignedUserIds}
              placeholder="👤 担当者を選択..."
            />
          </div>

          {/* 現在の場所表示 */}
          <div className="grid gap-2">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              📍 現在の場所
            </Label>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                📋 {task.board_title}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                📝 {task.list_title}
              </span>
            </div>
          </div>

          {/* ボード移動セクション */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MoveHorizontal className="h-4 w-4" />
                📋 ボード移動
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMoveSection(!showMoveSection)}
                className="text-xs h-7"
              >
                {showMoveSection ? '閉じる' : '移動する'}
              </Button>
            </div>
            
            {showMoveSection && (
              <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
                {boards.length > 0 && (
                  <div className="grid gap-1">
                    <Label className="text-xs font-medium text-gray-600">移動先ボード</Label>
                    <select 
                      value={selectedBoardId} 
                      onChange={(e) => setSelectedBoardId(e.target.value)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded"
                    >
                      <option value="">ボードを選択...</option>
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {selectedBoardId && lists.length > 0 && (
                  <div className="grid gap-1">
                    <Label className="text-xs font-medium text-gray-600">移動先リスト</Label>
                    <select 
                      value={selectedListId} 
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded"
                    >
                      <option value="">リストを選択...</option>
                      {lists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {selectedListId && selectedListId !== task.list_id && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleMoveCard}
                    className="w-full h-8 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                  >
                    <MoveHorizontal className="h-3 w-3 mr-1" />
                    🚀 移動実行
                  </Button>
                )}
              </div>
            )}
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
            onClick={handleSave} 
            disabled={!title.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            🚀 保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}