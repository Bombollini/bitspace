
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, IS_MOCK_MODE } from '../constants';
import { mockUsers, mockProjects, mockTasks, mockActivities, mockComments } from './mockData';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Interceptor for Demo
if (IS_MOCK_MODE) {
  axiosInstance.interceptors.request.use(async (config) => {
    // Delay to simulate network
    await new Promise(r => setTimeout(r, 600));
    return config;
  });

  // Mock Response logic could be complex; for simplicity in scaffold, we use direct service calls elsewhere if IS_MOCK_MODE.
  // But standard usage would use the axiosInstance.
}

// Global Auth Header Injection
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh Token Logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // TODO: Update logic for cookie-based vs token-based refresh
        // For token-based, we'd send the refresh token here
        const response = await axiosInstance.post('/auth/refresh');
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '#/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Unified API Wrapper to handle Mock vs Real
export const api = {
  auth: {
    login: async (credentials: any) => {
      if (IS_MOCK_MODE) {
        const user = mockUsers[0]; // Always login as owner for mock
        return { accessToken: 'mock-token', user };
      }
      const res = await axiosInstance.post('/auth/login', credentials);
      return res.data;
    },
    logout: async () => {
      if (IS_MOCK_MODE) return;
      await axiosInstance.post('/auth/logout');
    },
    me: async () => {
      if (IS_MOCK_MODE) return mockUsers[0];
      const res = await axiosInstance.get('/users/me');
      return res.data;
    }
  },
  projects: {
    list: async () => {
      if (IS_MOCK_MODE) return mockProjects;
      const res = await axiosInstance.get('/projects');
      return res.data;
    },
    get: async (id: string) => {
      if (IS_MOCK_MODE) return mockProjects.find(p => p.id === id);
      const res = await axiosInstance.get(`/projects/${id}`);
      return res.data;
    },
    members: async (id: string) => {
      if (IS_MOCK_MODE) return mockUsers;
      const res = await axiosInstance.get(`/projects/${id}/members`);
      return res.data;
    }
  },
  tasks: {
    list: async (projectId: string, filters: any = {}) => {
      if (IS_MOCK_MODE) {
        let tasks = mockTasks.filter(t => t.projectId === projectId);
        if (filters.q) tasks = tasks.filter(t => t.title.toLowerCase().includes(filters.q.toLowerCase()));
        if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
        return tasks;
      }
      const res = await axiosInstance.get(`/projects/${projectId}/tasks`, { params: filters });
      return res.data;
    },
    get: async (id: string) => {
      if (IS_MOCK_MODE) return mockTasks.find(t => t.id === id);
      const res = await axiosInstance.get(`/tasks/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      if (IS_MOCK_MODE) {
        const newTask = { ...data, id: `t${Date.now()}`, assignee: mockUsers.find(u => u.id === data.assigneeId) };
        mockTasks.push(newTask);
        return newTask;
      }
      const res = await axiosInstance.post('/tasks', data);
      return res.data;
    },
    update: async (id: string, data: any) => {
      if (IS_MOCK_MODE) {
        const idx = mockTasks.findIndex(t => t.id === id);
        if (idx > -1) mockTasks[idx] = { ...mockTasks[idx], ...data };
        return mockTasks[idx];
      }
      const res = await axiosInstance.patch(`/tasks/${id}`, data);
      return res.data;
    },
    comments: async (taskId: string) => {
      if (IS_MOCK_MODE) return mockComments.filter(c => c.taskId === taskId);
      const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return res.data;
    },
    addComment: async (taskId: string, body: string) => {
      if (IS_MOCK_MODE) {
        const newComment = { id: `c${Date.now()}`, taskId, userId: 'u1', user: mockUsers[0], body, createdAt: new Date().toISOString() };
        mockComments.push(newComment);
        return newComment;
      }
      const res = await axiosInstance.post(`/tasks/${taskId}/comments`, { body });
      return res.data;
    }
  },
  activity: {
    list: async (projectId: string) => {
      if (IS_MOCK_MODE) return mockActivities.filter(a => a.projectId === projectId);
      const res = await axiosInstance.get('/activity', { params: { projectId } });
      return res.data;
    }
  }
};
