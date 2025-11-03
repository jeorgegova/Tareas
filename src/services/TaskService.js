// services/TaskService.js
import { supabase } from '../lib/supabaseClient';

class TaskService {
  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks (
          id,
          content,
          completed,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(task => ({
      ...task,
      subtasks: task.subtasks || []
    }));
  }

  async createTask({ subtasks, ...taskData }) {
    console.log('subtasks createTask', subtasks);
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (taskError) throw taskError;

    if (subtasks && subtasks.length > 0) {
      const subtasksData = subtasks.map(content => ({
        task_id: task.id,
        content,
        completed: false
      }));
      await supabase.from('subtasks').insert(subtasksData);
    }

    return { ...task, subtasks: subtasks || [] };
  }

  async updateTask(id, { subtasks, ...taskData }) {
    console.log('subtasks updateTask', subtasks);
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();

    if (taskError) throw taskError;

    // Reemplazar subtareas
    await supabase.from('subtasks').delete().eq('task_id', id);
    if (subtasks && subtasks.length > 0) {
      const subtasksData = subtasks.map(content => ({
        task_id: id,
        content: content.content,
        completed: false
      }));
      await supabase.from('subtasks').insert(subtasksData);
    }

    return { ...task, subtasks: subtasks || [] };
  }

  // NUEVO: Marcar subtarea como completada
  async toggleSubtask(subtaskId, completed) {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ completed })
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export default new TaskService();