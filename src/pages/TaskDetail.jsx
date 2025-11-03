import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import { ArrowLeft, Edit3, Save, X, Calendar, CheckCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, toggleSubtask } = useTasks(); 

  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]); 
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cargar tarea
  useEffect(() => {
    const foundTask = tasks.find(t => t.id === id);
    console.log('taskkkk', task);
    
    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
      setStatus(foundTask.status || 'pending');
      setDueDate(foundTask.due_date ? foundTask.due_date.split('T')[0] : '');
      setSubtasks(foundTask.subtasks || []); 
    }
  }, [id, tasks]);

  // Guardar cambios
  const handleSave = async () => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setSaving(true);
    try {
      await updateTask(id, {
        title: title.trim(),
        description: description.trim(),
        status,
        due_date: dueDate || null,
        subtasks: subtasks.map(s => ({ content: s.content.trim(), completed: s.completed })).filter(s => s.content)
      });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar tarea
  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    try {
      await deleteTask(id);
      navigate('/');
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Tarea no encontrada</h2>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            ¡Tarea actualizada con éxito!
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a tareas
          </button>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Título + Acciones */}
          <div className="flex justify-between items-start mb-6">
            {editing ? (
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título de la tarea"
                className="text-3xl font-bold text-gray-800 w-full px-0 border-0 focus:ring-0 focus:outline-none"
                autoFocus
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
            )}

            <div className="flex gap-2 ml-4">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Guardar"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Cancelar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Descripción */}
          {editing ? (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none mb-6"
            />
          ) : (
            task.description && (
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">{task.description}</p>
            )
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Estado */}
            <div>
              <label className="text-sm font-semibold text-gray-600">Estado</label>
              {editing ? (
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completada</option>
                </select>
              ) : (
                <p className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.status === 'pending' ? 'Pendiente' :
                     task.status === 'in_progress' ? 'En Progreso' :
                     'Completada'}
                  </span>
                </p>
              )}
            </div>

            {/* Fecha límite */}
            <div>
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Fecha límite
              </label>
              {editing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-700">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                </p>
              )}
            </div>
          </div>

          {/* SUBTAREAS */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Subtareas
              </h3>
              <span className="text-sm text-gray-600">
                {subtasks.filter(s => s.completed).length} de {subtasks.length}
              </span>
            </div>

            {/* Barra de progreso */}
            {subtasks.length > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {editing ? (
              <div className="space-y-3">
                {subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex gap-2">
                    <input
                      type="text"
                      value={subtask.content}
                      onChange={e => {
                        const newSubs = [...subtasks];
                        newSubs[index].content = e.target.value;
                        setSubtasks(newSubs);
                      }}
                      placeholder="Subtarea..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSubs = subtasks.filter((_, i) => i !== index);
                        setSubtasks(newSubs);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSubtasks([...subtasks, { id: Date.now(), content: '', completed: false }])}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  + Agregar subtarea
                </button>
              </div>
            ) : subtasks.length > 0 ? (
              <ul className="space-y-2">
                {subtasks.map(subtask => (
                  <li key={subtask.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask(task.id, subtask.id)} // ← Usa contexto
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span
                      className={`flex-1 ${subtask.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-700'
                        }`}
                    >
                      {subtask.content}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay subtareas</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetail;