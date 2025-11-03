import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import { Plus, Trash2, Loader2, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const Home = () => {
  const { tasks, loading, deleteTask } = useTasks();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Cargando tareas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
            <Clock className="w-10 h-10 text-blue-600" />
            Mis Tareas
          </h1>
          <p className="text-gray-600">Gestiona tus tareas pendientes y en progreso</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'pending').length}</p>
            <p className="text-gray-600 text-sm">Pendientes</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
            <p className="text-gray-600 text-sm">En Progreso</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
            <p className="text-gray-600 text-sm">Completadas</p>
          </div>
        </div>

        {/* Add New Task Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
          </button>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay tareas</h3>
            <p className="text-gray-500">¡Crea tu primera tarea para empezar!</p>
            <button
              onClick={() => navigate('/new')}
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Crear Primera Tarea
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="flex justify-between items-start">
                  {/* Task Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition mb-1">
                      {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {task.status === 'pending' ? 'Pendiente' :
                          task.status === 'in_progress' ? 'En Progreso' :
                            'Completada'}
                      </span>

                      {/* Notes Count */}
                      {/* En la card de tarea */}
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4" />
                          {task.subtasks?.filter(s => s.completed).length || 0} / {task.subtasks?.length || 0} completadas
                        </div>
                        {task.subtasks?.length > 0 && (
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-600 h-1.5 rounded-full transition-all"
                              style={{
                                width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;