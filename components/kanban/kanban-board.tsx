'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
// import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Home, ArrowLeft, Edit2, Save, X, Target, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { KanbanList } from './kanban-list';
import { KanbanCard } from './kanban-card';
import { CardEditDialog } from './card-edit-dialog';
import { KanbanAPI } from '@/lib/supabase/kanban';
import type { BoardWithLists, List, Card } from '@/lib/types/kanban';

interface KanbanBoardProps {
  board: BoardWithLists;
  onAddList: (title: string) => void;
  onAddCard: (listId: string, title: string) => void;
  onMoveCard: (cardId: string, newListId: string, newPosition: number) => void;
  onDeleteCard?: (cardId: string) => void;
  onUpdateBoard?: (boardId: string, updates: { title?: string; description?: string }) => void;
  onUpdateList?: (listId: string, updates: { title?: string }) => void;
  onDeleteList?: (listId: string) => void;
  onUpdateCard?: (cardId: string, updates: { title?: string; description?: string; due_date?: string }) => void;
}

export function KanbanBoard({
  board,
  onAddList,
  onAddCard,
  onMoveCard,
  onDeleteCard,
  onUpdateBoard,
  onUpdateList,
  onDeleteList,
  onUpdateCard,
}: KanbanBoardProps) {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>(board.lists || []);
  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState(board.title);
  const [editBoardDescription, setEditBoardDescription] = useState(board.description || '');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isCardEditDialogOpen, setIsCardEditDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setLists(board.lists || []);
  }, [board.lists]);

  const handleAddList = () => {
    if (listTitle.trim()) {
      onAddList(listTitle.trim());
      setListTitle('');
      setIsAddingList(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAddingList(false);
      setListTitle('');
    }
  };

  const handleSaveBoardEdit = () => {
    if (editBoardTitle.trim() && onUpdateBoard) {
      onUpdateBoard(board.id, {
        title: editBoardTitle.trim(),
        description: editBoardDescription.trim() || undefined,
      });
    }
    setIsEditingBoard(false);
  };

  const handleCancelBoardEdit = () => {
    setEditBoardTitle(board.title);
    setEditBoardDescription(board.description || '');
    setIsEditingBoard(false);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setIsCardEditDialogOpen(true);
  };

  const handleSaveCard = (cardId: string, updates: { title?: string; description?: string; due_date?: string; due_time?: string; assigned_user_id?: string | null; assigned_user_ids?: string[] }) => {
    if (onUpdateCard) {
      onUpdateCard(cardId, updates);
    }
  };

  const handleMoveCardToBoard = async (cardId: string, targetListId: string) => {
    try {
      const kanbanAPI = new KanbanAPI();
      await kanbanAPI.moveCardToBoard(cardId, targetListId);
      // 移動後はページを再読み込みして最新状態を反映
      window.location.reload();
    } catch (error) {
      console.error('Failed to move card to board:', error);
      alert('カードの移動に失敗しました');
    }
  };

  const findCardById = useCallback((cardId: string): Card | null => {
    for (const list of lists) {
      const card = list.cards?.find((card) => card.id === cardId);
      if (card) return card;
    }
    return null;
  }, [lists]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCardById(active.id as string);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCard = findCardById(activeId);
    if (!activeCard) return;

    const activeList = lists.find(list => 
      list.cards?.some(card => card.id === activeId)
    );
    const overList = lists.find(list => list.id === overId) ||
      lists.find(list => list.cards?.some(card => card.id === overId));

    if (!activeList || !overList) return;

    if (activeList.id !== overList.id) {
      setLists(prevLists => {
        const newLists = [...prevLists];
        const activeListIndex = newLists.findIndex(list => list.id === activeList.id);
        const overListIndex = newLists.findIndex(list => list.id === overList.id);

        const activeCards = [...(newLists[activeListIndex].cards || [])];
        const overCards = [...(newLists[overListIndex].cards || [])];

        const activeCardIndex = activeCards.findIndex(card => card.id === activeId);
        const [movedCard] = activeCards.splice(activeCardIndex, 1);

        let overCardIndex = overCards.findIndex(card => card.id === overId);
        if (overCardIndex === -1) {
          overCardIndex = overCards.length;
        }

        overCards.splice(overCardIndex, 0, { ...movedCard, list_id: overList.id });

        newLists[activeListIndex] = { ...newLists[activeListIndex], cards: activeCards };
        newLists[overListIndex] = { ...newLists[overListIndex], cards: overCards };

        return newLists;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCard = findCardById(activeId);
    if (!activeCard) return;

    const overList = lists.find(list => list.id === overId) ||
      lists.find(list => list.cards?.some(card => card.id === overId));

    if (!overList) return;

    const overCards = overList.cards || [];
    let newPosition = 0;

    if (overId !== overList.id) {
      const overCardIndex = overCards.findIndex(card => card.id === overId);
      newPosition = overCardIndex !== -1 ? overCardIndex + 1 : overCards.length;
    } else {
      newPosition = overCards.length;
    }

    onMoveCard(activeId, overList.id, newPosition);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="px-6 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              ホーム
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/boards')}
              className="flex items-center gap-2 hover:bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              ボード一覧
            </Button>
          </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {isEditingBoard ? (
            <div className="space-y-4">
              <Input
                value={editBoardTitle}
                onChange={(e) => setEditBoardTitle(e.target.value)}
                className="text-3xl font-bold border-2 border-blue-200 focus:border-blue-400 rounded-xl p-4 bg-blue-50/50"
                placeholder="🎯 ボードタイトル..."
              />
              <Textarea
                value={editBoardDescription}
                onChange={(e) => setEditBoardDescription(e.target.value)}
                className="border-2 border-purple-200 focus:border-purple-400 rounded-xl p-4 bg-purple-50/50 resize-none"
                placeholder="ボードの説明..."
                rows={2}
              />
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  onClick={handleSaveBoardEdit}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelBoardEdit} className="rounded-lg">
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <div className="group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {board.title}
                    </h1>
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </div>
                  {board.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">{board.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBoard(true)}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="h-4 w-4 text-blue-600" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 pt-4 px-0">
          {lists.map((list) => (
            <KanbanList
              key={list.id}
              list={list}
              onAddCard={onAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={onDeleteCard}
              onUpdateList={onUpdateList}
              onDeleteList={onDeleteList}
            />
          ))}

          <div className="w-72 flex-shrink-0">
            {isAddingList ? (
              <div className="bg-white border-2 border-dashed border-blue-300 rounded-2xl p-6 shadow-lg">
                <Input
                  placeholder="📝 リストのタイトルを入力..."
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-blue-50/50"
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <Button 
                    size="sm" 
                    onClick={handleAddList}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex-1"
                  >
                    追加
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingList(false);
                      setListTitle('');
                    }}
                    className="rounded-lg"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-16 justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-2xl transition-all duration-200 group"
                onClick={() => setIsAddingList(true)}
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-gray-500 group-hover:text-blue-600 font-medium">新しいリストを追加</span>
                </div>
              </Button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-2">
              <KanbanCard card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardEditDialog
        card={editingCard}
        isOpen={isCardEditDialogOpen}
        onClose={() => {
          setIsCardEditDialogOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        onMoveToBoard={handleMoveCardToBoard}
        currentBoardId={board.id}
        currentListId={editingCard?.list_id}
      />
      </div>
    </div>
  );
}