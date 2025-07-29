import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { CreateListInput } from '@/lib/types/kanban';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateListInput = await request.json();

    const { data: list, error } = await supabase
      .from('lists')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}