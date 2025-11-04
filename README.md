# Tareas GoGi - Aplicación de Gestión de Tareas

Una aplicación moderna de gestión de tareas construida con React, Vite y Supabase. Incluye una interfaz limpia con Tailwind CSS, actualizaciones en tiempo real y un widget motivacional.

## Prerrequisitos

- Node.js versión 20 o superior
- Administrador de paquetes npm o yarn

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd tereas
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en el directorio raíz y agrega tu configuración de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre tu navegador y navega a `http://localhost:5173`

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con recarga en caliente
- `npm run build` - Construye el proyecto para producción
- `npm run preview` - Previsualiza la construcción de producción localmente
- `npm run lint` - Ejecuta ESLint para verificar problemas en el código

## Características

- Crear, leer, actualizar y eliminar tareas
- Filtrado de tareas por estado y rango de fechas
- Funcionalidad de búsqueda
- Panel de estadísticas de tareas
- Widget de frases motivadoras con manejo de errores
- Diseño responsivo
- Actualizaciones en tiempo real con Supabase
- Interfaz moderna con Tailwind CSS

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── MotivationalWidget.jsx
├── context/            # Proveedores de contexto de React
│   └── TasksContext.jsx
├── pages/              # Componentes de página
│   ├── Home.jsx
│   ├── NewTask.jsx
│   └── TaskDetail.jsx
├── services/           # Servicios de API
│   └── TaskService.js
├── lib/                # Librerías de utilidades
│   └── supabaseClient.js
└── assets/             # Recursos estáticos
```

## Tecnologías Utilizadas

- **Frontend**: React 19, React Router DOM
- **Herramienta de Construcción**: Vite
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Backend**: Supabase
- **Linting**: ESLint

## Contribuyendo

1. Haz un fork del repositorio
2. Crea una rama de características (`git checkout -b feature/caracteristica-increible`)
3. Confirma tus cambios (`git commit -m 'Agrega una característica increíble'`)
4. Sube a la rama (`git push origin feature/caracteristica-increible`)
5. Abre un Pull Request


