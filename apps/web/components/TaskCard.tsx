
import React from 'react';
import { Task, TaskStatus } from '../types';
import { Badge } from './Badge';
import { Calendar, MessageSquare, ChevronDown } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onStatusChange }) => {
  return (
    <div 
      className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onSelect(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge type="priority" value={task.priority} />
        <div className="relative group/menu">
          <button 
            className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <ChevronDown size={14} />
          </button>
          {/* Status Quick Select Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded shadow-lg z-10 hidden group-hover/menu:block">
            {Object.values(TaskStatus).map(status => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, status);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${task.status === status ? 'font-bold text-blue-600' : ''}`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar size={12} />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        
        {task.assignee && (
          <img 
            src={task.assignee.avatarUrl} 
            alt={task.assignee.name}
            title={task.assignee.name}
            className="w-6 h-6 rounded-full border-2 border-white"
          />
        )}
      </div>
    </div>
  );
};
