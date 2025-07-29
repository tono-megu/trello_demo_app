import { createClient } from './server';

export interface QuickTaskData {
  title: string;
  due_date?: string;
  due_time?: string;
  assigned_user_ids?: string[];
}

export async function getDefaultBoardAndList() {
  const supabase = await createClient();

  // 最初のボードを取得
  const { data: boards, error: boardError } = await supabase
    .from('boards')
    .select('id, title')
    .order('created_at', { ascending: true })
    .limit(1);

  if (boardError || !boards || boards.length === 0) {
    throw new Error('デフォルトボードが見つかりません');
  }

  const defaultBoard = boards[0];

  // そのボードの最初のリストを取得
  const { data: lists, error: listError } = await supabase
    .from('lists')
    .select('id, title')
    .eq('board_id', defaultBoard.id)
    .order('position', { ascending: true })
    .limit(1);

  if (listError || !lists || lists.length === 0) {
    throw new Error('デフォルトリストが見つかりません');
  }

  const defaultList = lists[0];

  return {
    board: defaultBoard,
    list: defaultList
  };
}

export async function createQuickTask(taskData: QuickTaskData) {
  const { board, list } = await getDefaultBoardAndList();
  
  // 既存のカード数を取得して position を決定
  const supabase = await createClient();
  const { data: existingCards, error: countError } = await supabase
    .from('cards')
    .select('position')
    .eq('list_id', list.id)
    .order('position', { ascending: false })
    .limit(1);

  if (countError) {
    console.error('Error getting card count:', countError);
  }

  const nextPosition = existingCards && existingCards.length > 0 
    ? existingCards[0].position + 1 
    : 1;

  // カードを作成（サーバー側のSupabaseクライアントを直接使用）
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .insert({
      title: taskData.title,
      list_id: list.id,
      position: nextPosition,
      due_date: taskData.due_date,
      due_time: taskData.due_time,
      assigned_user_ids: taskData.assigned_user_ids || []
    })
    .select()
    .single();

  if (cardError) {
    console.error('Error creating card:', cardError);
    throw cardError;
  }

  // 担当者がある場合は card_assignees テーブルにも追加
  if (taskData.assigned_user_ids && taskData.assigned_user_ids.length > 0) {
    const assignees = taskData.assigned_user_ids.map(userId => ({
      card_id: card.id,
      user_id: userId
    }));

    const { error: assigneeError } = await supabase
      .from('card_assignees')
      .insert(assignees);

    if (assigneeError) {
      console.error('Error adding assignees:', assigneeError);
    }
  }

  return {
    card,
    board,
    list
  };
}