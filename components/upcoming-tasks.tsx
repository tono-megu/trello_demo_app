'use client';

import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { HomeTaskEditDialog } from '@/components/home-task-edit-dialog';
import { KanbanAPI } from '@/lib/supabase/kanban';
import { generateTaskCardStyle, generateBoardBadgeStyle, generateListBadgeStyle } from '@/lib/utils/color-generator';

import { TaskCard } from '@/lib/supabase/tasks';

type Task = TaskCard;

interface TaskGroup {
  title: string;
  icon: React.ReactNode;
  color: string;
  tasks: Task[];
}

interface UpcomingTasksProps {
  initialTasks: TaskCard[];
}

export function UpcomingTasks({ initialTasks }: UpcomingTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setTasks(initialTasks);

    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: 'due_date=not.is.null'
        },
        () => {
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialTasks, supabase]);

  const handleEditTask = (task: TaskCard) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveTask = async (taskId: string, updates: { title?: string; description?: string; due_date?: string; due_time?: string; assigned_user_ids?: string[] }) => {
    try {
      const kanbanAPI = new KanbanAPI();
      await kanbanAPI.updateCard(taskId, updates);
      // ページを再読み込みして最新データを取得
      window.location.reload();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  const handleMoveTaskToBoard = async (taskId: string, targetListId: string) => {
    try {
      const kanbanAPI = new KanbanAPI();
      await kanbanAPI.moveCardToBoard(taskId, targetListId);
      // 移動後はページを再読み込みして最新状態を反映
      window.location.reload();
    } catch (error) {
      console.error('Failed to move task to board:', error);
      alert('タスクの移動に失敗しました');
    }
  };

  const categorizeTasksByDueDate = (tasks: Task[]): TaskGroup[] => {
    
    const overdueTasks = tasks.filter(task => isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)));
    const todayTasks = tasks.filter(task => isToday(new Date(task.due_date)));
    const thisWeekTasks = tasks.filter(task => 
      isThisWeek(new Date(task.due_date), { weekStartsOn: 1 }) && 
      !isToday(new Date(task.due_date)) && 
      !isPast(new Date(task.due_date))
    );

    return [
      {
        title: '期限切れ',
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'bg-red-500',
        tasks: overdueTasks
      },
      {
        title: '今日',
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-orange-500',
        tasks: todayTasks
      },
      {
        title: '今週',
        icon: <Calendar className="h-4 w-4" />,
        color: 'bg-blue-500',
        tasks: thisWeekTasks
      }
    ];
  };

  const taskGroups = categorizeTasksByDueDate(tasks);

  const formatTaskDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return '今日';
    if (isTomorrow(date)) return '明日';
    return format(date, 'MM/dd（E）', { locale: ja });
  };

  if (tasks.length === 0) {
    return (
      <Card className="w-full bg-white border-0 rounded-2xl shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            直近の納期
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-16 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white border-0 rounded-2xl shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            直近の納期
          </CardTitle>
          <p className="text-xs text-gray-500">← 左にドラッグで今日のタスクに追加</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {taskGroups.map((group, groupIndex) => (
          group.tasks.length > 0 && (
            <div key={groupIndex} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1 ${group.color} rounded-md text-white`}>
                  {group.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{group.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {group.tasks.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none"
                    style={generateTaskCardStyle(task.board_title)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(task));
                      e.dataTransfer.effectAllowed = 'move';
                      e.currentTarget.classList.add('opacity-50');
                      e.stopPropagation();
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.classList.remove('opacity-50');
                    }}
                    onClick={(e) => {
                      // ドラッグ中はクリックイベントを無効化
                      if (e.defaultPrevented) return;
                      handleEditTask(task);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatTaskDate(task.due_date)}
                          </div>
                          {task.due_time && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {task.due_time}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className="text-xs border max-w-[140px] flex-shrink-0 inline-flex items-center"
                            style={generateBoardBadgeStyle(task.board_title)}
                            title={task.board_title}
                          >
                            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap">
                              {task.board_title}
                            </span>
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs border truncate max-w-[100px] flex-shrink-0"
                            style={generateListBadgeStyle(task.list_title)}
                            title={task.list_title}
                          >
                            {task.list_title}
                          </Badge>
                          {task.assigned_users && task.assigned_users.length > 0 && (
                            <div className="flex items-center gap-1">
                              {task.assigned_users.length === 1 ? (
                                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200 px-1.5 py-0.5 text-xs font-normal">
                                  {task.assigned_users[0].display_name}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200 px-1.5 py-0.5 text-xs font-normal">
                                  {task.assigned_users.length}人の担当者
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
        
        {taskGroups.every(group => group.tasks.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">直近の納期はありません</p>
          </div>
        )}
      </CardContent>
      
      <HomeTaskEditDialog
        task={editingTask}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onMoveToBoard={handleMoveTaskToBoard}
      />
    </Card>
  );
}