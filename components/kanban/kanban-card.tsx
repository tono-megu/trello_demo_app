'use client';

import { useState, useEffect } from 'react';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, FileText, Sparkles, Calendar, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/kanban';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '@/lib/types/kanban';

interface KanbanCardProps {
  card: Card;
  onEdit?: (card: Card) => void;
  onDelete?: (cardId: string) => void;
}

export function KanbanCard({ card, onEdit, onDelete }: KanbanCardProps) {
  const [assignedUsers, setAssignedUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const loadAssignedUsers = async () => {
      // 複数担当者または単一担当者から配列を作成
      const userIds = card.assigned_user_ids || (card.assigned_user_id ? [card.assigned_user_id] : []);
      
      if (userIds.length > 0) {
        try {
          const supabase = createClient();
          const { data: users, error } = await supabase
            .from('user_profiles')
            .select('*')
            .in('id', userIds);
          
          if (error) throw error;
          setAssignedUsers(users || []);
        } catch (error) {
          console.error('Failed to load assigned users:', error);
        }
      } else {
        setAssignedUsers([]);
      }
    };

    loadAssignedUsers();
  }, [card.assigned_user_id, card.assigned_user_ids]);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    let displayText = '';
    if (isToday) {
      displayText = '今日';
    } else if (isTomorrow) {
      displayText = '明日';
    } else {
      displayText = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
    
    return { displayText, isOverdue, isToday, isTomorrow };
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-3 ${isDragging ? 'opacity-50 scale-105 rotate-2' : ''} transition-all duration-200`}
    >
      <UICard className="cursor-grab hover:shadow-lg transition-all duration-300 group bg-white border border-gray-200 rounded-xl hover:scale-105 hover:-rotate-1">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-2 mb-2">
                <div className="p-1 bg-white/60 rounded-md">
                  <FileText className="h-3 w-3 text-gray-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 leading-snug flex-1">
                  {card.title}
                </h4>
                <Sparkles className="h-3 w-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {card.description && (
                <p className="text-xs text-gray-600 leading-relaxed bg-white/40 rounded-lg p-2 mt-2">
                  {card.description}
                </p>
              )}
              {card.due_date && (
                <div className="mt-3">
                  {(() => {
                    const { displayText, isOverdue, isToday, isTomorrow } = formatDueDate(card.due_date);
                    return (
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 hover:scale-105 ${
                        isOverdue 
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300' 
                          : isToday 
                          ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-2 border-orange-300'
                          : isTomorrow
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300'
                          : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300'
                      }`}>
                        <div className={`p-1 rounded-lg ${
                          isOverdue 
                            ? 'bg-red-200' 
                            : isToday 
                            ? 'bg-orange-200'
                            : isTomorrow
                            ? 'bg-yellow-200'
                            : 'bg-blue-200'
                        }`}>
                          {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                        </div>
                        <span className="flex items-center gap-1">
                          {displayText}
                          {card.due_time && (
                            <span className="ml-1 text-xs opacity-80">
                              {card.due_time.slice(0, 5)}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
              {assignedUsers.length > 0 && (
                <div className="mt-2">
                  {assignedUsers.length === 1 ? (
                    // 単一担当者の場合
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200">
                      <div className="w-4 h-4 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                        {getUserInitials(assignedUsers[0].display_name)}
                      </div>
                      <span className="truncate text-xs">{assignedUsers[0].display_name}</span>
                    </div>
                  ) : (
                    // 複数担当者の場合
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        {assignedUsers.slice(0, 3).map((user, index) => (
                          <div
                            key={user.id}
                            className="w-4 h-4 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold border border-white"
                            style={{ zIndex: assignedUsers.length - index }}
                            title={user.display_name}
                          >
                            {getUserInitials(user.display_name)}
                          </div>
                        ))}
                        {assignedUsers.length > 3 && (
                          <div 
                            className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border border-white"
                            title={`他${assignedUsers.length - 3}人`}
                          >
                            +{assignedUsers.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-indigo-700 font-medium">
                        {assignedUsers.length}人
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/80 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
                <DropdownMenuItem onClick={() => onEdit?.(card)} className="rounded-lg">
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(card.id)}
                  className="text-destructive rounded-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </UICard>
    </div>
  );
}