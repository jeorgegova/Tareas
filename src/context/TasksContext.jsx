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
      const data = await TaskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task) => {
    try {
      const newTask = await TaskService.createTask(task);
      // Refresh tasks to get the latest data including notes
      await fetchTasks();
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

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    fetchTasks
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};