'use client';

import { createClient } from './client';
import type { TaskCard } from './tasks';

/**
 * 指定されたIDの配列に基づいてタスクを取得し、IDの順序を保持する（クライアント専用）
 */
export async function getTasksByIds(taskIds: string[]): Promise<TaskCard[]> {
  if (taskIds.length === 0) {
    return [];
  }

  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('cards')
    .select(`
      id,
      title,
      description,
      due_date,
      due_time,
      assigned_user_id,
      assigned_user_ids,
      lists!inner(
        id,
        title,
        boards!inner(
          id,
          title
        )
      ),
      card_assignees(
        user_profiles(
          id,
          display_name,
          email,
          avatar_url
        )
      )
    `)
    .in('id', taskIds);

  if (error) {
    console.error('Error fetching tasks by IDs:', error);
    return [];
  }

  // データを受け取った後、IDの順序に従って並び替える
  const taskMap = new Map<string, TaskCard>();
  
  data?.forEach((card: any) => {
    // due_time形式の統一（HH:MM:SS → HH:MM）
    let formattedDueTime = card.due_time;
    if (formattedDueTime) {
      const timeMatch = formattedDueTime.match(/^(\d{2}):(\d{2})/);
      if (timeMatch) {
        formattedDueTime = `${timeMatch[1]}:${timeMatch[2]}`;
      }
    }
    
    taskMap.set(card.id, {
      id: card.id,
      title: card.title,
      description: card.description,
      due_date: card.due_date,
      due_time: formattedDueTime,
      list_title: card.lists?.title || '',
      board_title: card.lists?.boards?.title || '',
      board_id: card.lists?.boards?.id || '',
      list_id: card.lists?.id || '',
      assigned_user_id: card.assigned_user_id,
      assigned_user_ids: card.assigned_user_ids,
      assigned_users: card.card_assignees?.map((assignee: any) => assignee.user_profiles).filter(Boolean) || [],
      assigned_user_name: card.card_assignees?.length > 0 
        ? card.card_assignees[0].user_profiles?.display_name 
        : null
    });
  });

  // IDの順序に従って結果を並び替え（存在しないIDは除外）
  return taskIds
    .map(id => taskMap.get(id))
    .filter((task): task is TaskCard => task !== undefined);
}