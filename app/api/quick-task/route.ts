import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createQuickTask, type QuickTaskData } from '@/lib/supabase/quick-tasks';

export async function POST(request: NextRequest) {
  try {
    console.log('Quick task API called');
    const supabase = await createClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User:', user?.id, 'Auth error:', authError);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskData: QuickTaskData = await request.json();
    console.log('Task data received:', taskData);

    // タスクを作成
    const result = await createQuickTask(taskData);
    console.log('Task creation result:', result);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Quick task creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    );
  }
}