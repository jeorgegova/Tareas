import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TasksProvider } from './context/TasksContext.jsx';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetail';
import NewTask from './pages/NewTask';

function App(){
  return (
    <BrowserRouter>
      <TasksProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/new" element={<NewTask />} />
        </Routes>
      </TasksProvider>
    </BrowserRouter>
  );
}

export default App;
