export interface Board {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  title: string;
  board_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  list_id: string;
  position: number;
  due_date: string | null;
  due_time: string | null;
  assigned_user_id: string | null; // 後方互換性のため残す
  assigned_user_ids: string[] | null;
  assignees?: UserProfile[];
  created_at: string;
  updated_at: string;
}

export interface BoardWithLists extends Board {
  lists: List[];
}

export interface CreateBoardInput {
  title: string;
  description?: string;
}

export interface CreateListInput {
  title: string;
  board_id: string;
  position: number;
}

export interface CreateCardInput {
  title: string;
  description?: string;
  list_id: string;
  position: number;
  due_date?: string;
  due_time?: string;
  assigned_user_id?: string; // 後方互換性のため残す
  assigned_user_ids?: string[];
}

export interface UpdateCardPositionInput {
  card_id: string;
  new_list_id: string;
  new_position: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}