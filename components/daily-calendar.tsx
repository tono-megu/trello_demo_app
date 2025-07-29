'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
              className="text-xs border truncate max-w-[100px] flex-shrink-0"
              style={generateListBadgeStyle(task.list_title)}
              title={task.list_title} // Tooltip for full text
            >
              {task.list_title}
            </Badge>
            {task.due_time && (
              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span className="whitespace-nowrap">{task.due_time}</span>
              </div>
            )}
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

  // ローカルストレージから今日のタスクを読み込み
  useEffect(() => {
    const saved = localStorage.getItem('todayTasks');
    if (saved) {
      try {
        setTodayTasks(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved today tasks:', error);
      }
    }
  }, []);

  // 今日のタスクをローカルストレージに保存
  const saveTodayTasks = (tasks: TodayTask[]) => {
    setTodayTasks(tasks);
    localStorage.setItem('todayTasks', JSON.stringify(tasks));
  };

  // ドラッグエンドハンドラー（並び替え）
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todayTasks.findIndex(task => task.id === active.id);
      const newIndex = todayTasks.findIndex(task => task.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(todayTasks, oldIndex, newIndex);
        saveTodayTasks(reorderedTasks);
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
        if (!todayTasks.find(t => t.id === task.id)) {
          const newTodayTasks = [...todayTasks, { ...task }];
          saveTodayTasks(newTodayTasks);
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
    const newTodayTasks = todayTasks.filter(t => t.id !== taskId);
    saveTodayTasks(newTodayTasks);
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日（E）', { locale: ja });
  };

  return (
    <Card className="w-full bg-white border-0 rounded-2xl shadow-lg">
      <CardContent className="p-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">今日のタスク</h3>
              <p className="text-xs text-gray-500">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {todayTasks.length}個
          </Badge>
        </div>

        {/* ドロップゾーン */}
        <div
          className="min-h-[300px] border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Plus className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">今日やるタスクをここにドラッグ</p>
              <p className="text-xs text-gray-400">右側のタスク一覧からドラッグ&ドロップできます</p>
            </div>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}