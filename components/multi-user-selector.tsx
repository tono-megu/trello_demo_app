'use client';

import { useState, useEffect } from 'react';
import { User, ChevronDown, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/kanban';

interface MultiUserSelectorProps {
  selectedUserIds?: string[];
  onUsersSelect: (userIds: string[]) => void;
  placeholder?: string;
}

export function MultiUserSelector({ selectedUserIds = [], onUsersSelect, placeholder = "担当者を選択" }: MultiUserSelectorProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const supabase = createClient();
        const { data: usersData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('display_name');
        
        if (error) throw error;
        setUsers(usersData || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleUser = (userId: string) => {
    const isSelected = selectedUserIds.includes(userId);
    const newUserIds = isSelected 
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    
    console.log('Toggling user:', { userId, isSelected, newUserIds });
    onUsersSelect(newUserIds);
  };

  const removeUser = (userId: string) => {
    onUsersSelect(selectedUserIds.filter(id => id !== userId));
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-start">
        <User className="h-4 w-4 mr-2" />
        読み込み中...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {/* 選択された担当者の表示 */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs"
            >
              <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {getUserInitials(user.display_name)}
              </div>
              <span className="truncate">{user.display_name}</span>
              <button
                onClick={() => removeUser(user.id)}
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 担当者選択ドロップダウン */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <User className="h-4 w-4 mr-2" />
            {selectedUsers.length > 0 
              ? `${selectedUsers.length}人の担当者`
              : placeholder
            }
            <ChevronDown className="h-4 w-4 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          <DropdownMenuItem onClick={() => onUsersSelect([])}>
            <User className="h-4 w-4 mr-2" />
            すべて解除
          </DropdownMenuItem>
          {users.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            return (
              <DropdownMenuItem
                key={user.id}
                onClick={() => toggleUser(user.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                    {getUserInitials(user.display_name)}
                  </div>
                  <span className="truncate flex-1">{user.display_name}</span>
                  {isSelected && <Check className="h-4 w-4 text-green-600" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}