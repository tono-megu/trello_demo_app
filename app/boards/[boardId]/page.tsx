'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { KanbanAPI } from '@/lib/supabase/kanban';
import { useBoardRealtime } from '@/hooks/use-board-realtime';
import type { BoardWithLists } from '@/lib/types/kanban';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const [board, setBoard] = useState<BoardWithLists | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const kanbanAPI = useMemo(() => new KanbanAPI(), []);

  const loadBoard = useCallback(async () => {
    try {
      const boardData = await kanbanAPI.getBoardWithLists(boardId);
      if (boardData) {
        // Sort lists by position and cards by position
        boardData.lists = boardData.lists
          .sort((a, b) => a.position - b.position)
          .map(list => ({
            ...list,
            cards: (list.cards || []).sort((a, b) => a.position - b.position)
          }));
        setBoard(boardData);
      }
    } catch (error) {
      console.error('Failed to load board:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  }, [boardId, kanbanAPI]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Set up real-time synchronization
  const handleRealtimeUpdate = useCallback(() => {
    loadBoard();
  }, [loadBoard]);

  useBoardRealtime(boardId, handleRealtimeUpdate);

  const handleAddList = async (title: string) => {
    if (!board) return;

    try {
      const position = board.lists.length;
      await kanbanAPI.createList({
        title,
        board_id: boardId,
        position,
      });
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to create list:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    if (!board) return;

    try {
      const list = board.lists.find(l => l.id === listId);
      const position = list?.cards?.length || 0;
      
      await kanbanAPI.createCard({
        title,
        list_id: listId,
        position,
      });
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to create card:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  const handleMoveCard = async (cardId: string, newListId: string, newPosition: number) => {
    try {
      await kanbanAPI.updateCardPosition({
        card_id: cardId,
        new_list_id: newListId,
        new_position: newPosition,
      });
      // Optimistic update - the board state is already updated by the DnD logic
    } catch (error) {
      console.error('Failed to move card:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
      // On error, reload the board to revert to server state
      loadBoard();
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await kanbanAPI.deleteCard(cardId);
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to delete card:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  const handleUpdateBoard = async (boardId: string, updates: { title?: string; description?: string }) => {
    try {
      await kanbanAPI.updateBoard(boardId, updates);
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update board:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  const handleUpdateList = async (listId: string, updates: { title?: string }) => {
    try {
      await kanbanAPI.updateList(listId, updates);
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update list:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await kanbanAPI.deleteList(listId);
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to delete list:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  const handleUpdateCard = async (cardId: string, updates: { title?: string; description?: string; due_date?: string; due_time?: string; assigned_user_id?: string | null; assigned_user_ids?: string[] }) => {
    try {
      await kanbanAPI.updateCard(cardId, updates);
      loadBoard(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update card:', error instanceof Error ? error.message : (error as any)?.message || JSON.stringify(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">ボードが見つかりません</h2>
          <p className="text-muted-foreground">
            指定されたボードは存在しないか、アクセス権限がありません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <KanbanBoard
      board={board}
      onAddList={handleAddList}
      onAddCard={handleAddCard}
      onMoveCard={handleMoveCard}
      onDeleteCard={handleDeleteCard}
      onUpdateBoard={handleUpdateBoard}
      onUpdateList={handleUpdateList}
      onDeleteList={handleDeleteList}
      onUpdateCard={handleUpdateCard}
    />
  );
}