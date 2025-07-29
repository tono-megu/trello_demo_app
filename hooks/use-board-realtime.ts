'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useBoardRealtime(boardId: string, onUpdate: () => void) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const supabase = createClient();
    
    // Create a channel for this board
    const channel = supabase
      .channel(`board-${boardId}`)
      // Listen to lists changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `board_id=eq.${boardId}`
        },
        (payload) => {
          console.log('Lists change:', payload);
          onUpdate();
        }
      )
      // Listen to cards changes for all lists in this board
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards'
        },
        async (payload) => {
          console.log('Cards change:', payload);
          
          // Check if this card belongs to a list in our board
          if (payload.new && typeof payload.new === 'object' && 'list_id' in payload.new) {
            const { data: list } = await supabase
              .from('lists')
              .select('board_id')
              .eq('id', payload.new.list_id)
              .single();
            
            if (list?.board_id === boardId) {
              onUpdate();
            }
          } else if (payload.old && typeof payload.old === 'object' && 'list_id' in payload.old) {
            const { data: list } = await supabase
              .from('lists')
              .select('board_id')
              .eq('id', payload.old.list_id)
              .single();
            
            if (list?.board_id === boardId) {
              onUpdate();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('Unsubscribing from realtime channel');
      supabase.removeChannel(channel);
    };
  }, [boardId, onUpdate]);

  return channelRef.current;
}