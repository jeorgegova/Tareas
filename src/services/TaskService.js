import { supabase } from '../lib/supabaseClient';

class TaskService {
  async getAllTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTaskById(id) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const { notes, ...taskFields } = taskData;

      // Create the task first
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([taskFields])
        .select();

      if (taskError) throw taskError;

      // If notes are provided, create them
      if (notes && notes.length > 0) {
        const notesData = notes.map(note => ({
          task_id: task[0].id,
          content: note
        }));

        const { error: notesError } = await supabase
          .from('notes')
          .insert(notesData);

        if (notesError) throw notesError;
      }

      return task[0];
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTaskWithNotes(id) {
    try {
      // Get task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskError) throw taskError;

      // Get notes for the task
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('task_id', id)
        .order('created_at', { ascending: true });

      if (notesError) throw notesError;

      return {
        ...task,
        notes: notes || []
      };
    } catch (error) {
      console.error('Error fetching task with notes:', error);
      throw error;
    }
  }

  async updateTaskWithNotes(id, taskData) {
    try {
      const { notes, ...taskFields } = taskData;

      // Update the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .update(taskFields)
        .eq('id', id)
        .select();

      if (taskError) throw taskError;

      // If notes are provided, replace existing notes
      if (notes && notes.length > 0) {
        // First delete existing notes
        await supabase
          .from('notes')
          .delete()
          .eq('task_id', id);

        // Then insert new notes
        const notesData = notes.map(note => ({
          task_id: id,
          content: note
        }));

        const { error: notesError } = await supabase
          .from('notes')
          .insert(notesData);

        if (notesError) throw notesError;
      }

      return task[0];
    } catch (error) {
      console.error('Error updating task with notes:', error);
      throw error;
    }
  }
  async updateTask(id, updates) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

export default new TaskService();