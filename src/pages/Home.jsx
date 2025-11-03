import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import { Plus, Trash2, Loader2, Clock, AlertCircle, CheckCircle, Search, Filter, Calendar } from 'lucide-react';

// === FORMATO DE FECHA ===
const formatDate = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`; // 04/11/2025
};

const Home = () => {
  const { tasks, loading, deleteTask } = useTasks();
  const navigate = useNavigate();

  // === FILTROS ===
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // === PAGINACIÓN ===
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Hoy
  const todayUTC = new Date();
todayUTC.setUTCHours(0, 0, 0, 0);

  // === FILTRADO ===
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      let matchesDate = true;
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && dueDate >= from;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && dueDate <= to;
        }
      } else {
        matchesDate = !dateFrom && !dateTo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [tasks, searchTerm, statusFilter, dateFrom, dateTo]);

  // === RESETEAR PÁGINA AL CAMBIAR FILTROS ===
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  // === PAGINACIÓN ===
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, tasksPerPage]);

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // === ESTADÍSTICAS ===
  const stats = useMemo(() => ({
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    in_progress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length
  }), [filteredTasks]);

  // === TAREA VENCIDA ===
  const isOverdue = (task) => {
  if (!task.due_date || task.status === 'completed') return false;

  // Convertir due_date (YYYY-MM-DD) a UTC medianoche
  const [year, month, day] = task.due_date.split('-').map(Number);
  const dueDateUTC = new Date(Date.UTC(year, month - 1, day)); // UTC

  return dueDateUTC < todayUTC;
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">

        {/* TÍTULO */}
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-3">
          <Clock className="w-10 h-10 text-blue-600" />
          Mis Tareas
        </h1>

        {/* STATS EN LÍNEA */}
        <div className="flex justify-center gap-12 mb-8 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
            <p className="text-sm text-gray-600">En Progreso</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completadas</p>
          </div>
        </div>

        {/* FILTROS EN 2 LÍNEAS */}
        <div className="space-y-3 mb-8">

          {/* LÍNEA 1: ESTADO + FECHAS */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* ESTADO */}
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[160px]"
              >
                <option value="all">Estado: Todas</option>
                <option value="pending">Pendientes</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
              </select>
            </div>

            {/* DESDE */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Desde:</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* HASTA */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Hasta:</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* LÍNEA 2: BÚSQUEDA + NUEVA TAREA */}
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            <button
              onClick={() => navigate('/new')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition"
            >
              <Plus className="w-5 h-5" />
              Nueva Tarea
            </button>
          </div>
        </div>

        {/* LISTA DE TAREAS */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' || dateFrom || dateTo
                ? 'No se encontraron tareas'
                : 'No hay tareas'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || dateFrom || dateTo
                ? 'Intenta con otros filtros'
                : '¡Crea tu primera tarea para comenzar!'}
            </p>
            {(searchTerm || statusFilter !== 'all' || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedTasks.map(task => {
                const overdue = isOverdue(task);
                return (
                  <div
                    key={task.id}
                    className={`
                      bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all cursor-pointer
                      ${overdue ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-200'}
                    `}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 ${overdue ? 'text-red-800' : 'text-gray-800'}`}>
                          {task.title}
                          {overdue && <span className="ml-2 text-xs font-bold text-red-600">[VENCIDA]</span>}
                        </h3>

                        {task.description && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(task.due_date)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.status === 'pending' ? 'Pendiente' :
                             task.status === 'in_progress' ? 'En Progreso' :
                             'Completada'}
                          </span>
                        </div>

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} completadas
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-600 h-1 rounded-full transition-all"
                                style={{
                                  width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}

            {/* INFO DE PAGINACIÓN */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Mostrando {(currentPage - 1) * tasksPerPage + 1}-
              {Math.min(currentPage * tasksPerPage, filteredTasks.length)} de {filteredTasks.length} tareas
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;