import React, { Fragment, useState, useEffect, useCallback } from 'react';
import './App.css';
import InputTodo from './components/InputTodo';
import ListTodos from './components/ListTodos';
import Toast from './components/Toast';

function App() {
  const [todos, setTodos] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState('');

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/todos')
      .then(r => r.json())
      .then(setTodos)
      .catch(console.error);
  }, []);

  const addTodo = async (description) => {
    const res = await fetch('http://localhost:5000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    const newTodo = await res.json();
    setTodos(prev => [...prev, newTodo]);
    addToast('Todo added!');
  };

  const deleteTodo = async (id) => {
    setTodos(prev => prev.filter(t => t.todo_id !== id));
    await fetch(`http://localhost:5000/todos/${id}`, { method: 'DELETE' });
    addToast('Todo deleted.', 'danger');
  };

  const updateTodo = async (id, description) => {
    setTodos(prev => prev.map(t => t.todo_id === id ? { ...t, description } : t));
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    addToast('Todo updated!');
  };

  const toggleComplete = async (id) => {
    setTodos(prev => prev.map(t => t.todo_id === id ? { ...t, completed: !t.completed } : t));
    await fetch(`http://localhost:5000/todos/${id}/toggle`, { method: 'PATCH' });
  };

  const filtered = todos.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const remaining = todos.filter(t => !t.completed).length;

  return (
    <Fragment>
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 className="app-title text-center mt-5 mb-4">PERN Todo List</h1>
        <div className="todo-card">
          <InputTodo addTodo={addTodo} />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search todos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ListTodos
            todos={filtered}
            hasSearch={search.length > 0}
            deleteTodo={deleteTodo}
            updateTodo={updateTodo}
            toggleComplete={toggleComplete}
          />
          {todos.length > 0 && (
            <p className="todo-count">
              {remaining} of {todos.length} remaining
            </p>
          )}
        </div>
      </div>
      <Toast toasts={toasts} />
    </Fragment>
  );
}

export default App;
