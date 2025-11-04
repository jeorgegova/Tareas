import TaskService from './TaskService';
import { supabase } from '../lib/supabaseClient';

// Mock Supabase
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockTaskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        due_date: '2023-12-31'
      };

      const mockTaskResponse = {
        id: 1,
        ...mockTaskData,
        created_at: '2023-11-01T00:00:00Z'
      };

      // Mock the task insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockTaskResponse,
              error: null
            })
          })
        })
      });

      const result = await TaskService.createTask(mockTaskData);

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(result).toEqual({
        ...mockTaskResponse,
        subtasks: [],
        notes: []
      });
    });

    it('should create a task with subtasks', async () => {
      const mockTaskData = {
        title: 'Test Task with Subtasks',
        subtasks: [
          { content: 'Subtask 1', completed: false },
          { content: 'Subtask 2', completed: true }
        ]
      };

      const mockTaskResponse = {
        id: 1,
        title: 'Test Task with Subtasks',
        created_at: '2023-11-01T00:00:00Z'
      };

      // Mock task insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockTaskResponse,
              error: null
            })
          })
        })
      });

      // Mock subtasks insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({
          data: null,
          error: null
        })
      });

      const result = await TaskService.createTask(mockTaskData);

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(supabase.from).toHaveBeenCalledWith('subtasks');
      expect(result).toEqual({
        ...mockTaskResponse,
        subtasks: mockTaskData.subtasks,
        notes: []
      });
    });

    it('should create a task with notes', async () => {
      const mockTaskData = {
        title: 'Test Task with Notes',
        notes: [
          { content: 'Note 1' },
          { content: 'Note 2' }
        ]
      };

      const mockTaskResponse = {
        id: 1,
        title: 'Test Task with Notes',
        created_at: '2023-11-01T00:00:00Z'
      };

      // Mock task insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockTaskResponse,
              error: null
            })
          })
        })
      });

      // Mock notes insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({
          data: null,
          error: null
        })
      });

      const result = await TaskService.createTask(mockTaskData);

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(supabase.from).toHaveBeenCalledWith('notes');
      expect(result).toEqual({
        ...mockTaskResponse,
        subtasks: [],
        notes: mockTaskData.notes
      });
    });

    it('should throw error when task creation fails', async () => {
      const mockTaskData = {
        title: 'Test Task'
      };

      // Mock task insert error
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: new Error('Insert failed')
            })
          })
        })
      });

      await expect(TaskService.createTask(mockTaskData)).rejects.toThrow('Insert failed');
    });
  });
});