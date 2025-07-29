import { createClient } from './server';

export interface TaskCard {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  list_title: string;
  board_title: string;
  board_id: string;
  list_id: string;
  assigned_user_id?: string | null;
  assigned_user_ids?: string[];
  assigned_user_name?: string | null;
  assigned_users?: Array<{
    id: string;
    display_name: string;
    email: string;
    avatar_url?: string;
  }>;
}

export async function getUpcomingTasks(): Promise<TaskCard[]> {
  const supabase = await createClient();
  
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
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error fetching upcoming tasks:', error);
    return [];
  }

  return data?.map((card: any) => ({
    id: card.id,
    title: card.title,
    description: card.description,
    due_date: card.due_date,
    due_time: card.due_time,
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
  })) || [];
}