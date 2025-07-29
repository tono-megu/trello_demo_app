import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { CreateCardInput, UpdateCardPositionInput, Card } from '@/lib/types/kanban';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateCardInput = await request.json();

    const { data: card, error } = await supabase
      .from('cards')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle position update (existing functionality)
    if ('new_list_id' in body && 'new_position' in body) {
      const positionBody: UpdateCardPositionInput = body;
      const { data: card, error } = await supabase
        .from('cards')
        .update({
          list_id: positionBody.new_list_id,
          position: positionBody.new_position
        })
        .eq('id', positionBody.card_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(card);
    }

    // Handle card content update (new functionality)
    if ('id' in body) {
      const updateData: Partial<Card> = {};
      if ('title' in body) updateData.title = body.title;
      if ('description' in body) updateData.description = body.description;
      if ('due_date' in body) updateData.due_date = body.due_date;
      if ('due_time' in body) updateData.due_time = body.due_time;

      const { data: card, error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(card);
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}