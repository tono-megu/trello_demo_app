'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Home, MoreHorizontal, Trash2, Sparkles, FolderOpen, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { KanbanAPI } from '@/lib/supabase/kanban';
import type { Board } from '@/lib/types/kanban';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });

  const kanbanAPI = useMemo(() => new KanbanAPI(), []);

  const loadBoards = useCallback(async () => {
    try {
      const boardsData = await kanbanAPI.getBoards();
      setBoards(boardsData);
      console.log('Loaded boards:', boardsData.length, 'boards');
    } catch (error) {
      console.error('Failed to load boards:', error);
      alert(`ボード読み込みエラー: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [kanbanAPI]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleCreateBoard = async () => {
    if (!newBoard.title.trim()) return;

    try {
      await kanbanAPI.createBoard({
        title: newBoard.title.trim(),
        description: newBoard.description.trim() || undefined,
      });
      setNewBoard({ title: '', description: '' });
      setIsCreateDialogOpen(false);
      loadBoards();
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('このボードを削除してもよろしいですか？すべてのリストとカードも削除されます。')) {
      return;
    }
    
    try {
      await kanbanAPI.deleteBoard(boardId);
      loadBoards();
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-muted-foreground font-medium">素敵なボードを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/protected')}
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              ホーム
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  マイボード
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-gray-600 text-lg font-medium">
                🚀 プロジェクトを整理して、夢を実現しましょう！
              </p>
            </div>
          </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              ✨ 新しいボードを作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいボードを作成</DialogTitle>
              <DialogDescription>
                プロジェクトやタスクを管理するための新しいボードを作成します。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  placeholder="ボードのタイトルを入力..."
                  value={newBoard.title}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">説明（オプション）</Label>
                <Input
                  id="description"
                  placeholder="ボードの説明を入力..."
                  value={newBoard.description}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateBoard} className="flex-1">
                  作成
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto border border-gray-100">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-blue-500" />
              </div>
              <div className="text-6xl mb-4">🎯</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">はじめましょう！</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              最初のボードを作成して、<br />素晴らしいプロジェクトをスタートしませんか？
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              🚀 最初のボードを作成
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boards.map((board, index) => (
            <Card
              key={board.id}
              className="group hover:shadow-2xl transition-all duration-300 bg-white border-0 rounded-2xl overflow-hidden hover:scale-105 cursor-pointer relative h-48"
              style={{
                background: `linear-gradient(135deg, ${[
                  'from-pink-100 to-rose-100',
                  'from-blue-100 to-cyan-100', 
                  'from-green-100 to-emerald-100',
                  'from-purple-100 to-violet-100',
                  'from-yellow-100 to-orange-100',
                  'from-indigo-100 to-blue-100'
                ][index % 6]})`
              }}
              onClick={(e) => {
                // DropdownMenuのクリック時は遷移しない
                if (e.target instanceof Element && 
                    (e.target.closest('[role="menuitem"]') || 
                     e.target.closest('button[data-state]') ||
                     e.target.closest('[data-radix-collection-item]') ||
                     e.target.closest('[data-radix-dropdown-menu-trigger]'))) {
                  return;
                }
                router.push(`/protected/boards/${board.id}`);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                      {board.title}
                    </CardTitle>
                    {board.description && (
                      <CardDescription className="text-gray-600 leading-relaxed text-sm">{board.description}</CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 relative z-10"
                        onClick={(e) => {
                          e.stopPropagation(); // カードクリックを阻止
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation(); // カードクリックを阻止
                          handleDeleteBoard(board.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-2 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 bg-white/60 rounded-full px-3 py-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    作成日: {formatDate(board.created_at)}
                  </div>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}