import React from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';

const Home = () => {
  const { tasks, loading, deleteTask } = useTasks();

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <h1>Tasks</h1>
      <Link to="/new">Add New Task</Link>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <Link to={`/tasks/${task.id}`}>{task.title}</Link>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;