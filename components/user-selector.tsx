'use client';

import { useState, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/kanban';

interface UserSelectorProps {
  selectedUserId?: string | null;
  onUserSelect: (userId: string | null) => void;
  placeholder?: string;
}

export function UserSelector({ selectedUserId, onUserSelect, placeholder = "担当者を選択" }: UserSelectorProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const selectedUser = users.find(user => user.id === selectedUserId);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                {getUserInitials(selectedUser.display_name)}
              </div>
              <span className="truncate">{selectedUser.display_name}</span>
            </div>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              {placeholder}
            </>
          )}
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuItem onClick={() => onUserSelect(null)}>
          <User className="h-4 w-4 mr-2" />
          担当者なし
        </DropdownMenuItem>
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => onUserSelect(user.id)}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                {getUserInitials(user.display_name)}
              </div>
              <span className="truncate">{user.display_name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}