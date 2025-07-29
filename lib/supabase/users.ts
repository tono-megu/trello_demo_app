import { createClient } from './client';
import { createClient as createServerClient } from './server';
import type { UserProfile } from '../types/kanban';

export async function getUsers(): Promise<UserProfile[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('display_name');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

export async function getUsersServer(): Promise<UserProfile[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('display_name');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}