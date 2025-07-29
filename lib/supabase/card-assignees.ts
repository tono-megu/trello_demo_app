import { createClient } from './client';

export async function updateCardAssignees(cardId: string, userIds: string[]): Promise<void> {
  const supabase = createClient();
  
  console.log('Updating card assignees:', { cardId, userIds });

  // 既存の担当者を削除
  const { error: deleteError } = await supabase
    .from('card_assignees')
    .delete()
    .eq('card_id', cardId);

  if (deleteError) {
    console.error('Error deleting assignees:', deleteError);
    throw deleteError;
  }

  // 新しい担当者を追加
  if (userIds.length > 0) {
    const assignees = userIds.map(userId => ({
      card_id: cardId,
      user_id: userId
    }));

    console.log('Inserting assignees:', assignees);

    const { error } = await supabase
      .from('card_assignees')
      .insert(assignees);

    if (error) {
      console.error('Error inserting assignees:', error);
      throw error;
    }
  }

  // cardsテーブルのassigned_user_idsも更新
  const { error: updateError } = await supabase
    .from('cards')
    .update({ 
      assigned_user_ids: userIds,
      assigned_user_id: userIds.length > 0 ? userIds[0] : null // 後方互換性
    })
    .eq('id', cardId);

  if (updateError) {
    console.error('Error updating cards table:', updateError);
    throw updateError;
  }

  console.log('Card assignees updated successfully');
}