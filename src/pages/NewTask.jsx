import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';

const NewTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
    notes: ['']
  });
  const [errors, setErrors] = useState({});
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNoteChange = (index, value) => {
    const newNotes = [...formData.notes];
    newNotes[index] = value;
    setFormData(prev => ({
      ...prev,
      notes: newNotes
    }));
    // Clear notes error when user starts typing
    if (errors.notes) {
      setErrors(prev => ({
        ...prev,
        notes: ''
      }));
    }
  };

  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      notes: [...prev.notes, '']
    }));
  };

  const removeNote = (index) => {
    if (formData.notes.length > 1) {
      const newNotes = formData.notes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        notes: newNotes
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    // Validate that at least one note is filled
    const hasValidNote = formData.notes.some(note => note.trim());
    if (!hasValidNote) {
      newErrors.notes = 'At least one note is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.dueDate,
        status: formData.status,
        created_at: new Date().toISOString(),
        notes: formData.notes.filter(note => note.trim()) // Only include non-empty notes
      };

      await addTask(taskData);
      navigate('/');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="task-form">
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date *</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            className={errors.dueDate ? 'error' : ''}
          />
          {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes *</label>
          {formData.notes.map((note, index) => (
            <div key={index} className="note-input">
              <input
                type="text"
                value={note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                placeholder={`Note ${index + 1}`}
                className={errors.notes ? 'error' : ''}
              />
              {formData.notes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNote(index)}
                  className="remove-note"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addNote} className="add-note">
            Add Note
          </button>
          {errors.notes && <span className="error-message">{errors.notes}</span>}
        </div>

        <div className="form-actions">
          <button type="submit">Create Task</button>
          <button type="button" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default NewTask;