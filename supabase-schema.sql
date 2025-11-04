-- Habilitar UUID
create extension if not exists "uuid-ossp";

-- Tabla: tasks
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla: notes
create table subtasks (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks(id) on delete cascade,
  content text not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- Índice para mejor rendimiento
create index if not exists idx_subtasks_task_id on subtasks(task_id);

CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para mejor rendimiento
CREATE INDEX idx_notes_task_id ON notes(task_id);

-- Trigger: actualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_tasks
  before update on tasks
  for each row
  execute function update_updated_at();


-- Policys
-- Permitir leer a cualquiera
CREATE POLICY "Public SELECT on tasks"
  ON tasks
  FOR SELECT
  TO public, anon
  USING (true);

-- Permitir insertar a cualquiera
CREATE POLICY "Public INSERT on tasks"
  ON tasks
  FOR INSERT
  TO public, anon
  WITH CHECK (true);

-- Permitir actualizar a cualquiera
CREATE POLICY "Public UPDATE on tasks"
  ON tasks
  FOR UPDATE
  TO public, anon
  USING (true);

-- Permitir eliminar a cualquiera
CREATE POLICY "Public DELETE on tasks"
  ON tasks
  FOR DELETE
  TO public, anon
  USING (true);


-- Permitir leer a cualquiera
CREATE POLICY "Public SELECT on subtasks"
  ON subtasks
  FOR SELECT
  TO public, anon
  USING (true);

-- Permitir insertar a cualquiera
CREATE POLICY "Public INSERT on subtasks"
  ON subtasks
  FOR INSERT
  TO public, anon
  WITH CHECK (true);

-- Permitir actualizar a cualquiera
CREATE POLICY "Public UPDATE on subtasks"
  ON subtasks
  FOR UPDATE
  TO public, anon
  USING (true);

-- Permitir eliminar a cualquiera
CREATE POLICY "Public DELETE on subtasks"
  ON subtasks
  FOR DELETE
  TO public, anon
  USING (true);
