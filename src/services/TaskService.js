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
        ),
        notes (
          id,
          content,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('tareas en supabase', data);
    
    return data.map(task => ({
      ...task,
      subtasks: task.subtasks || [],
      notes: task.notes || []
    }));
  }

  async createTask({ subtasks, notes, ...taskData }) {
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (taskError) throw taskError;

    // Subtareas
    if (subtasks && subtasks.length > 0) {
      const subtasksData = subtasks.map(s => ({
        task_id: task.id,
        content: s.content,
        completed: s.completed || false
      }));
      await supabase.from('subtasks').insert(subtasksData);
    }

    // Notas
    if (notes && notes.length > 0) {
      const notesData = notes.map(n => ({
        task_id: task.id,
        content: n.content
      }));
      await supabase.from('notes').insert(notesData);
    }

    return {
      ...task,
      subtasks: subtasks || [],
      notes: notes || []
    };
  }

  async updateTask(id, { subtasks, notes: updatedNotes, ...taskData }) {
  console.log('subtasks updateTask', subtasks);

  // 1. Actualizar la tarea principal
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single();

  if (taskError) throw taskError;

  // 2. Reemplazar subtareas (si se envían)
  if (subtasks !== undefined) {
    if (subtasks.length > 0) {
      await supabase.from('subtasks').delete().eq('task_id', id);

      const subtasksData = subtasks.map(s => ({
        task_id: id,
        content: s.content,
        completed: s.completed || false
      }));
      await supabase.from('subtasks').insert(subtasksData);
    } else {
      // Si se envía un array vacío, eliminar todas las subtareas
      await supabase.from('subtasks').delete().eq('task_id', id);
    }
  }

  // 3. **Volver a obtener la tarea completa con subtareas y notas**
  const { data: updatedTask, error: fetchError } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks (
        id,
        content,
        completed,
        created_at
      ),
      notes (
        id,
        content,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  return {
    ...updatedTask,
    subtasks: updatedTask.subtasks || [],
    notes: updatedTask.notes || []
  };
}

  async addNote(taskId, content) {
    const { data, error } = await supabase
      .from('notes')
      .insert({ task_id: taskId, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNote(noteId) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    return true;
  }

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