
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/apiClient';
import { Project, Task, TaskStatus, User, UserRole, Activity } from '../types';
import { Layout } from '../components/Layout';
import { TaskCard } from '../components/TaskCard';
import { Badge } from '../components/Badge';
import { TaskModal } from '../components/TaskModal';
import { useAuth } from '../services/authStore';
import { 
  Plus, 
  Users, 
  Activity as ActivityIcon, 
  LayoutGrid, 
  Info,
  Search,
  Filter,
  UserPlus
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'members' | 'activity'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projData, tasksData, membersData, activityData] = await Promise.all([
        api.projects.get(projectId),
        api.tasks.list(projectId),
        api.projects.members(projectId),
        api.activity.list(projectId)
      ]);
      setProject(projData);
      setTasks(tasksData);
      setMembers(membersData);
      setActivities(activityData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.tasks.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      const newTask = await api.tasks.create(data);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const canManageMembers = currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN;

  const columns = [
    { title: 'Backlog', status: TaskStatus.BACKLOG },
    { title: 'To Do', status: TaskStatus.TODO },
    { title: 'In Progress', status: TaskStatus.IN_PROGRESS },
    { title: 'Review', status: TaskStatus.REVIEW },
    { title: 'Done', status: TaskStatus.DONE },
  ];

  if (isLoading && !project) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
  if (!project) return <Layout><div className="text-center py-20">Project not found.</div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        {/* Project Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <span>Projects</span>
              <span>/</span>
              <span className="text-blue-600">{project.name}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">{project.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
               <Users size={20} />
            </button>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="font-semibold text-sm">New Task</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'tasks', name: 'Tasks', icon: LayoutGrid },
            { id: 'overview', name: 'Overview', icon: Info },
            { id: 'members', name: 'Members', icon: Users },
            { id: 'activity', name: 'Activity', icon: ActivityIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search tasks by name..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  <Filter size={16} />
                  Filters
                </button>
              </div>

              {/* Kanban Board */}
              <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
                {columns.map(col => {
                  const columnTasks = tasks.filter(t => t.status === col.status && (searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : true));
                  return (
                    <div key={col.status} className="flex-shrink-0 w-72 flex flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{col.title}</h3>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">{columnTasks.length}</span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {columnTasks.length === 0 ? (
                          <div className="h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                            No tasks here
                          </div>
                        ) : (
                          columnTasks.map(task => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              onSelect={() => {}} 
                              onStatusChange={handleStatusChange} 
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Project Description</h3>
                    <p className="text-slate-600 leading-relaxed">{project.description}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                       <h4 className="text-blue-600 text-xs font-bold uppercase mb-1">Created At</h4>
                       <p className="text-blue-900 font-semibold">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                       <h4 className="text-emerald-600 text-xs font-bold uppercase mb-1">Total Completion</h4>
                       <p className="text-emerald-900 font-semibold">{Math.round(((project.stats?.completedTasks || 0) / (project.stats?.totalTasks || 1)) * 100)}%</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Team Progress</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">JD</div>
                          <div className="flex-1">
                             <div className="flex justify-between text-xs font-semibold mb-1">
                                <span>John Doe</span>
                                <span className="text-blue-600">80%</span>
                             </div>
                             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-[80%]"></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Team Members</h3>
                {canManageMembers && (
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-semibold">
                    <UserPlus size={16} />
                    Invite
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {members.map(member => (
                  <div key={member.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={member.avatarUrl} className="w-10 h-10 rounded-full" alt={member.name} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge type="role" value={member.role} />
                      {canManageMembers && member.id !== currentUser?.id && (
                        <button className="text-xs font-bold text-rose-600 hover:underline">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
             <div className="max-w-2xl mx-auto space-y-6">
                {activities.map((activity, idx) => (
                   <div key={activity.id} className="relative pl-8 pb-8 last:pb-0">
                      {idx !== activities.length - 1 && <div className="absolute left-3.5 top-2 bottom-0 w-px bg-slate-200"></div>}
                      <div className="absolute left-0 top-0 w-7 h-7 bg-white rounded-full border border-slate-200 flex items-center justify-center z-10">
                        <ActivityIcon size={14} className="text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">User ID: {activity.userId}</span>
                          <span className="text-xs text-slate-400">{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {activity.action} <span className="font-semibold text-blue-600">{activity.targetType} #{activity.targetId}</span>
                        </p>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSubmit={handleCreateTask}
        members={members}
        projectId={projectId!}
      />
    </Layout>
  );
};
