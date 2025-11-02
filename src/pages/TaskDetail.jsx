import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';

const TaskDetail = () => {
  const { id } = useParams();
  const { tasks, updateTask } = useTasks();
  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === parseInt(id));
    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
    }
  }, [id, tasks]);

  const handleSave = async () => {
    try {
      await updateTask(task.id, { title, description });
      setEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div>
      <Link to="/">← Back to Tasks</Link>
      {editing ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;