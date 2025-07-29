import { createClient } from './client';
import { updateCardAssignees } from './card-assignees';
import type { 
  Board, 
  List, 
  Card, 
  BoardWithLists, 
  CreateBoardInput, 
  CreateListInput, 
  CreateCardInput,
  UpdateCardPositionInput
} from '../types/kanban';

export class KanbanAPI {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // Boards
  async getBoards(): Promise<Board[]> {
    // 認証状態をチェック
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    console.log('Current user:', user?.id, 'Auth error:', authError);

    const { data, error } = await this.supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Boards data:', data, 'Error:', error);
    console.log('Boards count:', data?.length || 0);
    if (error) throw error;
    return data || [];
  }

  async getBoardLists(boardId: string): Promise<List[]> {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getBoardWithLists(boardId: string): Promise<BoardWithLists | null> {
    const { data, error } = await this.supabase
      .from('boards')
      .select(`
        *,
        lists(
          *,
          cards(
            *,
            card_assignees(
              user_profiles(
                id,
                display_name,
                email,
                avatar_url
              )
            )
          )
        )
      `)
      .eq('id', boardId)
      .single();

    if (error) throw error;
    
    // due_timeの形式を確認・修正と assigned_users情報の生成
    if (data?.lists) {
      data.lists.forEach((list: any) => {
        if (list.cards) {
          list.cards.forEach((card: any) => {
            // due_time形式の修正
            if (card.due_time) {
              // time型の場合、HH:MM:SS形式から HH:MM形式に変換
              const timeMatch = card.due_time.match(/^(\d{2}):(\d{2})/);
              if (timeMatch) {
                card.due_time = `${timeMatch[1]}:${timeMatch[2]}`;
              }
              console.log('Card due_time processed:', card.id, card.due_time);
            }
            
            // assigned_users情報の生成（TaskCard型との一貫性を保つ）
            card.assigned_users = card.card_assignees?.map((assignee: any) => assignee.user_profiles).filter(Boolean) || [];
            card.assigned_user_name = card.assigned_users.length > 0 
              ? card.assigned_users[0].display_name 
              : null;
          });
        }
      });
    }
    
    return data;
  }

  async createBoard(input: CreateBoardInput): Promise<Board> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('boards')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBoard(boardId: string, updates: Partial<CreateBoardInput>): Promise<Board> {
    const { data, error } = await this.supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBoard(boardId: string): Promise<void> {
    const { error } = await this.supabase
      .from('boards')
      .delete()
      .eq('id', boardId);

    if (error) throw error;
  }

  // Lists
  async createList(input: CreateListInput): Promise<List> {
    const { data, error } = await this.supabase
      .from('lists')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateList(listId: string, updates: Partial<Pick<List, 'title' | 'position'>>): Promise<List> {
    const { data, error } = await this.supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteList(listId: string): Promise<void> {
    const { error } = await this.supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
  }

  // Cards
  async createCard(input: CreateCardInput): Promise<Card> {
    const { data, error } = await this.supabase
      .from('cards')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCard(cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'position' | 'list_id' | 'due_date' | 'due_time' | 'assigned_user_id' | 'assigned_user_ids'>>): Promise<Card> {
    // 担当者が更新される場合は別途処理
    if (updates.assigned_user_ids !== undefined) {
      await updateCardAssignees(cardId, updates.assigned_user_ids || []);
      // assigned_user_idsをupdatesから除去（別途処理したため）
      const { assigned_user_ids, ...otherUpdates } = updates;
      updates = otherUpdates;
    }

    const { data, error } = await this.supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async moveCardToBoard(cardId: string, targetListId: string): Promise<Card> {
    // 移動先リストの最後の位置を取得
    const { data: existingCards, error: countError } = await this.supabase
      .from('cards')
      .select('position')
      .eq('list_id', targetListId)
      .order('position', { ascending: false })
      .limit(1);

    if (countError) {
      console.error('Error getting card count:', countError);
    }

    const nextPosition = existingCards && existingCards.length > 0 
      ? existingCards[0].position + 1 
      : 1;

    // カードを新しいリストに移動
    const { data, error } = await this.supabase
      .from('cards')
      .update({
        list_id: targetListId,
        position: nextPosition
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCardPosition(input: UpdateCardPositionInput): Promise<Card> {
    const { data, error } = await this.supabase
      .from('cards')
      .update({
        list_id: input.new_list_id,
        position: input.new_position
      })
      .eq('id', input.card_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  }

  // Real-time subscriptions
  subscribeToBoard(boardId: string, callback: (payload: unknown) => void) {
    return this.supabase
      .channel(`board-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `board_id=eq.${boardId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards'
        },
        callback
      )
      .subscribe();
  }
}