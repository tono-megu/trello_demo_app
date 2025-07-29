'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal, Edit2, Save, X, Trash2, List as ListIcon, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import type { List, Card as KanbanCardType } from '@/lib/types/kanban';

interface KanbanListProps {
  list: List;
  onAddCard: (listId: string, title: string) => void;
  onEditCard?: (card: KanbanCardType) => void;
  onDeleteCard?: (cardId: string) => void;
  onUpdateList?: (listId: string, updates: { title?: string }) => void;
  onDeleteList?: (listId: string) => void;
}

export function KanbanList({ list, onAddCard, onEditCard, onDeleteCard, onUpdateList, onDeleteList }: KanbanListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  const cards = list.cards || [];
  const cardIds = cards.map(card => card.id);

  const handleAddCard = () => {
    if (cardTitle.trim()) {
      onAddCard(list.id, cardTitle.trim());
      setCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setCardTitle('');
    }
  };

  const handleSaveListTitle = () => {
    if (editTitle.trim() && onUpdateList) {
      onUpdateList(list.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelListEdit = () => {
    setEditTitle(list.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveListTitle();
    } else if (e.key === 'Escape') {
      handleCancelListEdit();
    }
  };

  return (
    <Card className="w-72 flex-shrink-0 bg-white shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="text-sm font-bold border-2 border-blue-300 focus:border-blue-500 rounded-lg bg-white/80 h-8"
                autoFocus
              />
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-green-100 rounded-lg" onClick={handleSaveListTitle}>
                  <Save className="h-3 w-3 text-green-600" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-100 rounded-lg" onClick={handleCancelListEdit}>
                  <X className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-500 rounded-lg">
                  <ListIcon className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">{list.title}</h3>
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/80 rounded-lg">
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)} className="rounded-lg">
                    <Edit2 className="h-4 w-4 mr-2" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteList?.(list.id)}
                    className="text-destructive rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-4 pb-4">
        <div
          ref={setNodeRef}
          className="min-h-[200px] space-y-3"
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
          </SortableContext>

          {isAddingCard ? (
            <div className="space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-dashed border-blue-200">
              <Input
                placeholder="📝 カードのタイトルを入力..."
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-lg bg-white/80"
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAddCard}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex-1"
                >
                  ✨ 追加
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingCard(false);
                    setCardTitle('');
                  }}
                  className="rounded-lg"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-200 py-3"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              📝 カードを追加
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}