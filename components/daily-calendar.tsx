'use client';

import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Clock, Calendar, Plus, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskCard } from '@/lib/supabase/tasks';
import { getTasksByIds } from '@/lib/supabase/client-tasks';
import { generateTaskCardStyle, generateBoardBadgeStyle, generateListBadgeStyle } from '@/lib/utils/color-generator';

interface TodayTask extends TaskCard {
  timeSlot?: string;
}

interface DailyCalendarProps {
  onTaskDrop?: (taskId: string) => void;
}

// ソータブルなタスクカードコンポーネント
function SortableTaskCard({ task, onRemove }: { task: TodayTask; onRemove: (taskId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...generateTaskCardStyle(task.board_title),
  };

  // 日付フォーマット関数（upcoming-tasksと同じ）
  const formatTaskDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return '今日';
    if (isTomorrow(date)) return '明日';
    return format(date, 'MM/dd（E）', { locale: ja });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {/* ドラッグハンドル */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* タスク内容 */}
        <div className="flex-1 min-w-0"> {/* min-w-0 for proper flex shrinking */}
          <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">
              {task.description}
            </p>
          )}
          {/* 日付と時間の表示 */}
          {(task.due_date || task.due_time) && (
            <div className="flex items-center gap-3 mt-2">
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {formatTaskDate(task.due_date)}
                </div>
              )}
              {task.due_time && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {task.due_time}
                </div>
              )}
            </div>
          )}
          
          {/* バッジ表示 */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="text-xs border max-w-[140px] flex-shrink-0 inline-flex items-center"
              style={generateBoardBadgeStyle(task.board_title)}
              title={task.board_title} // Tooltip for full text
            >
              <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap">
                {task.board_title}
              </span>
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs border max-w-[100px] flex-shrink-0 inline-flex items-center"
              style={generateListBadgeStyle(task.list_title)}
              title={task.list_title} // Tooltip for full text
            >
              <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap">
                {task.list_title}
              </span>
            </Badge>
          </div>
        </div>

        {/* 削除ボタン */}
        <button
          onClick={() => onRemove(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs flex-shrink-0 p-1 -mr-1"
          title="今日のタスクから削除"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function DailyCalendar({ onTaskDrop }: DailyCalendarProps) {
  const [selectedDate] = useState(new Date());
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [todayTaskIds, setTodayTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ドラッグ&ドロップセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ローカルストレージから今日のタスクIDを読み込み、Supabaseから最新データを取得
  useEffect(() => {
    const loadTodayTasks = async () => {
      setIsLoading(true);
      try {
        const saved = localStorage.getItem('todayTaskIds');
        if (saved) {
          const taskIds: string[] = JSON.parse(saved);
          setTodayTaskIds(taskIds);
          
          if (taskIds.length > 0) {
            const tasks = await getTasksByIds(taskIds);
            setTodayTasks(tasks);
          } else {
            setTodayTasks([]);
          }
        } else {
          setTodayTasks([]);
          setTodayTaskIds([]);
        }
      } catch (error) {
        console.error('Failed to load today tasks:', error);
        setTodayTasks([]);
        setTodayTaskIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayTasks();
  }, []);

  // 今日のタスクIDをローカルストレージに保存し、タスクデータを更新
  const saveTodayTaskIds = async (taskIds: string[]) => {
    setTodayTaskIds(taskIds);
    localStorage.setItem('todayTaskIds', JSON.stringify(taskIds));
    
    // 最新のタスクデータを取得
    if (taskIds.length > 0) {
      try {
        const tasks = await getTasksByIds(taskIds);
        setTodayTasks(tasks);
      } catch (error) {
        console.error('Failed to fetch updated tasks:', error);
      }
    } else {
      setTodayTasks([]);
    }
  };

  // ドラッグエンドハンドラー（並び替え）
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todayTaskIds.findIndex(id => id === active.id);
      const newIndex = todayTaskIds.findIndex(id => id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedIds = arrayMove(todayTaskIds, oldIndex, newIndex);
        saveTodayTaskIds(reorderedIds);
      }
    }
  };

  // ドラッグオーバーハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ドロップハンドラー
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskData = e.dataTransfer.getData('application/json');
    if (taskData) {
      try {
        const task: TaskCard = JSON.parse(taskData);
        // すでに今日のタスクに追加されていないかチェック
        if (!todayTaskIds.includes(task.id)) {
          const newTodayTaskIds = [...todayTaskIds, task.id];
          saveTodayTaskIds(newTodayTaskIds);
          // オプショナルなコールバック
          if (onTaskDrop) {
            onTaskDrop(task.id);
          }
          console.log('Task dropped to today:', task.id);
        }
      } catch (error) {
        console.error('Failed to parse dropped task:', error);
      }
    }
  };

  // タスクを今日のリストから削除
  const removeTaskFromToday = (taskId: string) => {
    const newTodayTaskIds = todayTaskIds.filter(id => id !== taskId);
    saveTodayTaskIds(newTodayTaskIds);
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日（E）', { locale: ja });
  };

  return (
    <Card className="w-full bg-white border-0 rounded-2xl shadow-lg min-h-[600px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">今日のタスク</h3>
              <p className="text-xs text-slate-500">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {todayTasks.length}個
          </Badge>
        </div>

        {/* ドロップゾーン */}
        <div
          className="flex-1 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 flex flex-col"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-500">タスクを読み込み中...</p>
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Plus className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">今日やるタスクをここにドラッグ</p>
              <p className="text-xs text-gray-400">右側のタスク一覧からドラッグ&ドロップできます</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={todayTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {todayTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onRemove={removeTaskFromToday}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}