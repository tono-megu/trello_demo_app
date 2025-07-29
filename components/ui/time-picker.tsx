'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  time?: string;
  onTimeChange: (time: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ time, onTimeChange, placeholder, className }: TimePickerProps) {
  // 5分刻みの時間選択肢を生成（08:00から開始）
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeString,
          label: timeString
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className={`relative ${className}`}>
      <Select
        value={time || ''}
        onValueChange={(value) => onTimeChange(value || undefined)}
      >
        <SelectTrigger className="pl-10">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <SelectValue placeholder={placeholder || '時間を選択'} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {timeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}