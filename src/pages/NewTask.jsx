import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import { Plus, Trash2, Calendar, AlertCircle, CheckCircle, CheckSquare, ArrowLeft } from 'lucide-react';

const NewTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
    subtasks: [''] // ← Cambiado de notes a subtasks
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addTask } = useTasks();
  const navigate = useNavigate();

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleSubtaskChange = (index, value) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index] = value;
    setFormData(prev => ({ ...prev, subtasks: newSubtasks }));
    clearError('subtasks');
  };

  const addSubtask = () => {
    setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, ''] }));
  };

  const removeSubtask = (index) => {
    if (formData.subtasks.length > 1) {
      setFormData(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter((_, i) => i !== index)
      }));
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.dueDate) newErrors.dueDate = 'La fecha es obligatoria';

    const validSubtasks = formData.subtasks.filter(s => s.trim());
    if (validSubtasks.length === 0) {
      newErrors.subtasks = 'Agrega al menos una subtarea';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.dueDate,
        status: formData.status,
        subtasks: formData.subtasks.filter(s => s.trim()) // ← Enviar como subtasks
      };

      await addTask(taskData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'No se pudo crear la tarea' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <CheckSquare className="w-8 h-8 text-blue-600" />
          Nueva Tarea
        </h1>
        <p className="text-gray-600 mt-2">Divide tu tarea en pasos manejables</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          ¡Tarea creada con éxito! Redirigiendo...
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 space-y-6">

        {/* Title */}
        <div>
          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Preparar presentación"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Explica el objetivo general..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.description}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
            Fecha límite <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.dueDate}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Estado inicial
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completada</option>
          </select>
        </div>

        {/* SUBTAREAS */}
        <div>
          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-3">
            Subtareas <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {formData.subtasks.map((subtask, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-3 text-gray-400 text-sm">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={subtask}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder="Ej: Investigar tema principal"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.subtasks ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formData.subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="absolute right-2 top-3 text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSubtask}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Agregar subtarea
          </button>

          {errors.subtasks && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.subtasks}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.submit}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
              }`}
          >
            {submitting ? (
              <>Guardando...</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Crear Tarea
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTask;