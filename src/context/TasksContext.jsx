import React, { createContext, useContext, useState, useEffect } from 'react';
import TaskService from '../services/TaskService';

const TasksContext = createContext();

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await TaskService.createTask(taskData);
      // Añadir al inicio sin recargar todo
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const updatedTask = await TaskService.updateTask(id, updates);
      setTasks(prev => prev.map(task =>
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await TaskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const addNote = async (taskId, content) => {
    try {
      const newNote = await TaskService.addNote(taskId, content);
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, notes: [...task.notes, newNote] }
          : task
      ));
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const deleteNote = async (noteId, taskId) => {
    try {
      await TaskService.deleteNote(noteId);
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, notes: task.notes.filter(n => n.id !== noteId) }
          : task
      ));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  // Marcar subtarea como completada
  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const subtask = task.subtasks.find(s => s.id === subtaskId);
      const newCompleted = !subtask.completed;

      const updatedSubtask = await TaskService.toggleSubtask(subtaskId, newCompleted);

      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? {
            ...t,
            subtasks: t.subtasks.map(s =>
              s.id === subtaskId ? updatedSubtask : s
            )
          }
          : t
      ));
    } catch (error) {
      console.error('Error toggling subtask:', error);
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addNote,
    deleteNote,
    refresh: fetchTasks
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};