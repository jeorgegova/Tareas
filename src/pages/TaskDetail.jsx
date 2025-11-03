import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import {
  ArrowLeft, Edit3, Save, X, Calendar, CheckCircle,
  Trash2, Loader2, AlertCircle, Lock, MessageSquare, Plus
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tasks, updateTask, deleteTask,
    addNote, deleteNote
  } = useTasks();

  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // === VERIFICAR ID ===
  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('ID de tarea inválido');
      navigate('/');
    }
  }, [id, navigate]);

  // === CARGAR TAREA Y NORMALIZAR SUBTAREAS ===
  useEffect(() => {
    const foundTask = tasks.find(t => t.id === id);
    if (!foundTask) {
      console.warn('Tarea no encontrada:', id);
      return;
    }

    setTask(foundTask);
    setTitle(foundTask.title);
    setDescription(foundTask.description || '');
    setDueDate(foundTask.due_date || '');

    // === NORMALIZAR SUBTAREAS ===
    const rawSubtasks = foundTask.subtasks || [];
    const normalizedSubtasks = rawSubtasks.map(sub => {
      if (typeof sub === 'string') {
        // Subtarea legacy (solo string)
        return {
          id: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: sub,
          completed: false
        };
      }
      return {
        id: sub.id ?? `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: sub.content || '',
        completed: !!sub.completed
      };
    });

    setSubtasks(normalizedSubtasks);
    setNotes(foundTask.notes || []);

    const autoStatus = getStatusFromSubtasks(normalizedSubtasks);
    setStatus(foundTask.subtasks?.length > 0 ? autoStatus : foundTask.status);
  }, [id, tasks]);

  // === CALCULAR ESTADO AUTOMÁTICO ===
  const getStatusFromSubtasks = (list) => {
    if (!list || list.length === 0) return 'pending';
    const completed = list.filter(s => s.completed).length;
    if (completed === 0) return 'pending';
    if (completed === list.length) return 'completed';
    return 'in_progress';
  };

  // === TOGGLE SUBTAREA ===
  const handleToggleSubtask = async (subtaskId) => {
    try {
      const updatedSubtasks = subtasks.map(s =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      setSubtasks(updatedSubtasks);
      const newStatus = getStatusFromSubtasks(updatedSubtasks);

      await updateTask(id, {
        subtasks: updatedSubtasks,
        status: newStatus
      });

      setStatus(newStatus);
    } catch (error) {
      alert('Error al actualizar subtarea');
    }
  };

  // === AGREGAR NOTA ===
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addNote(id, newNote.trim());
      setNewNote('');
    } catch (error) {
      alert('Error al guardar nota');
    }
  };

  // === ELIMINAR NOTA ===
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId, id);
    } catch (error) {
      alert('Error al eliminar nota');
    }
  };

  // === GUARDAR CAMBIOS ===
  const handleSave = async () => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const finalSubtasks = subtasks
        .map(s => ({ id: s.id, content: s.content.trim(), completed: s.completed }))
        .filter(s => s.content);

      const finalStatus = finalSubtasks.length > 0
        ? getStatusFromSubtasks(finalSubtasks)
        : status;

      await updateTask(id, {
        title: title.trim(),
        description: description.trim(),
        status: finalStatus,
        due_date: dueDate || null,
        subtasks: finalSubtasks
      });

      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  // === ELIMINAR TAREA ===
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
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const hasSubtasks = subtasks.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            ¡Tarea actualizada con éxito!
          </div>
        )}

        {/* Volver */}
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

          {/* Título + Botones */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none mb-6"
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
                <div className="mt-1">
                  {hasSubtasks ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm italic">Automático según subtareas</span>
                    </div>
                  ) : (
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completada</option>
                    </select>
                  )}
                </div>
              ) : (
                <p className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {status === 'pending' ? 'Pendiente' :
                     status === 'in_progress' ? 'En Progreso' :
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
                  {formatDate(task.due_date)}
                </p>
              )}
            </div>
          </div>

          {/* SUBTAREAS */}
          <div className="border-t pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Subtareas
              </h3>
              <span className="text-sm text-gray-600">
                {subtasks.filter(s => s.completed).length} de {subtasks.length}
              </span>
            </div>

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
                  <div key={subtask.id ?? index} className="flex gap-2">
                    <input
                      type="text"
                      value={subtask.content || ''}
                      onChange={e => {
                        const newSubs = [...subtasks];
                        newSubs[index] = {
                          ...newSubs[index],
                          content: e.target.value
                        };
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
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSubtasks([
                      ...subtasks,
                      {
                        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        content: '',
                        completed: false
                      }
                    ]);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
                >
                  + Agregar subtarea
                </button>
              </div>
            ) : subtasks.length > 0 ? (
              <ul className="space-y-2">
                {subtasks.map(subtask => (
                  <li key={subtask.id ?? Math.random()} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(subtask.id)}
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

          {/* NOTAS */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Notas
            </h3>

            {/* Lista de notas */}
            <div className="space-y-3 mb-4">
              {notes.length > 0 ? (
                notes.map(note => (
                  <div
                    key={note.id}
                    className="bg-gray-50 p-3 rounded-lg flex justify-between items-start gap-3"
                  >
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-sm">No hay notas</p>
              )}
            </div>

            {/* Nueva nota */}
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Escribe una nota... (Enter para guardar)"
                rows="2"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
              <button
                onClick={handleAddNote}
                className="self-end p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                title="Agregar nota"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// === FORMATO DE FECHA ===
const formatDate = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export default TaskDetail;