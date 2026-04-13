# Feature Update Walkthrough
## What was installed / downloaded?
**Nothing.** No `npm install` was run. No new packages were added to `package.json`.
The only external resource added was the **Inter font**, loaded at runtime from Google Fonts CDN —
it's a `<link>` tag in index.html, not a local file.

All new features are built with React (already present) and Bootstrap 5 (already on CDN).

---

## File-by-File Walkthrough

---

### `server/database.sql`
```sql
-- Migration: add completed flag
-- Run this once against your existing database (skip if column already exists):
ALTER TABLE todo ADD COLUMN completed BOOLEAN DEFAULT FALSE;
//
// The original table only had todo_id and description.
// This adds a third column called `completed`.
// BOOLEAN means it holds true/false.
// DEFAULT FALSE means every existing and new row starts as not completed.
// You only run this once manually in your Postgres client (psql, pgAdmin, etc).
```

---

### `server/index.js` — new route
```js
app.patch("/todos/:id/toggle", async (req, res) => {
//  ^^^^ PATCH is the HTTP verb for partial updates — we're only flipping one field.
//       We could use PUT but PATCH is semantically correct here.

    const { id } = req.params;
    //  Pull the todo's id out of the URL, e.g. /todos/3/toggle → id = "3"

    const result = await pool.query(
        "UPDATE todo SET completed = NOT completed WHERE todo_id = $1 RETURNING *",
        //                           ^^^^^^^^^^^^^^^^^^^^
        //  NOT completed flips the value in the database itself.
        //  If it was false it becomes true, and vice versa.
        //  RETURNING * sends back the updated row so the frontend has fresh data.
        [id]
    );
    res.json(result.rows[0]);
    //  Send the updated todo back as JSON.
});
```

---

### `client/public/index.html` — font + title
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!--   ^^^^
  This loads the Inter typeface from Google's servers when the page opens.
  Nothing is downloaded to the project folder — it fetches at runtime.
  wght@300;400;500;600;700 loads five weight variants (light → bold).
  display=swap means text shows in a fallback font instantly,
  then swaps to Inter once it loads — no invisible text flash.
-->

<title>PERN Todo</title>
<!-- Changed from the default "React App" create-react-app placeholder. -->
```

---

### `client/src/index.css` — gradient background
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  /*            ^^^^^^^
    Inter is first in the stack. If it hasn't loaded yet (or fails),
    the browser falls back to the system font (-apple-system on Mac,
    Segoe UI on Windows, Roboto on Android).
  */
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /*                           ^^^
    135deg draws the gradient diagonally (top-left → bottom-right).
    #667eea is a periwinkle blue, #764ba2 is a medium purple.
    0% and 100% are the start and end positions.
  */
}

#root {
  min-height: 100vh;
  /*
    The React app mounts inside <div id="root">.
    Without this, if the page content is short, the gradient
    would stop at the bottom of the content instead of filling
    the whole viewport.
  */
}
```

---

### `client/src/App.js` — state management hub
```jsx
const [todos, setTodos] = useState([]);
//  All todos live HERE now, in the top-level App component.
//  Previously each component fetched its own data and reloaded the page.
//  Lifting state up means every child shares the same source of truth.

const [toasts, setToasts] = useState([]);
//  An array of { id, message, type } objects.
//  When a toast is added it gets pushed in; a timer removes it 3.2s later.

const [search, setSearch] = useState('');
//  The current value of the search input.
//  Stored here so we can use it to filter `todos` before passing them down.

const addToast = useCallback((message, type = 'success') => {
//               ^^^^^^^^^^^ useCallback memoizes the function so it doesn't
//               get recreated on every render (minor perf improvement).
    const id = Date.now();
    //  Date.now() gives a unique millisecond timestamp — used as the key
    //  so React can tell toasts apart in the list.
    setToasts(prev => [...prev, { id, message, type }]);
    //  Spread the existing toasts and append the new one.
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    //  After 3.2 seconds, remove this specific toast by filtering it out.
    //  3.2s matches the CSS animation duration (3s visible + 0.2s fade out).
}, []);

useEffect(() => {
    fetch('http://localhost:5000/todos')
      .then(r => r.json())
      .then(setTodos)  // ← shorthand for .then(data => setTodos(data))
      .catch(console.error);
}, []);
//  [] means this runs once when the component first mounts — like componentDidMount.
//  It fetches all todos from the server and puts them in state.

const addTodo = async (description) => {
    const res = await fetch(...POST...);
    const newTodo = await res.json();
    //  We wait for the server response because we need the todo_id
    //  that Postgres generates. We can't fake that client-side.
    setTodos(prev => [...prev, newTodo]);
    //  Append the new todo. The list updates instantly without a reload.
    addToast('Todo added!');
};

const deleteTodo = async (id) => {
    setTodos(prev => prev.filter(t => t.todo_id !== id));
    //  Remove the todo from state BEFORE the server call — this is
    //  "optimistic UI". The UI updates instantly; the server catches up.
    await fetch(`...DELETE...`);
    addToast('Todo deleted.', 'danger');
};

const updateTodo = async (id, description) => {
    setTodos(prev => prev.map(t => t.todo_id === id ? { ...t, description } : t));
    //  .map() returns a new array. For the matching todo, spread its
    //  existing fields and overwrite just description. All others unchanged.
    await fetch(...PUT...);
    addToast('Todo updated!');
};

const toggleComplete = async (id) => {
    setTodos(prev => prev.map(t =>
        t.todo_id === id ? { ...t, completed: !t.completed } : t
    ));
    //  Flip completed locally (optimistic), then sync with the server.
    await fetch(`.../toggle`, { method: 'PATCH' });
};

const filtered = todos.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase())
);
//  Client-side search — no server call needed.
//  .toLowerCase() on both sides makes it case-insensitive.
//  `filtered` is what gets passed to ListTodos, not `todos` directly.

const remaining = todos.filter(t => !t.completed).length;
//  Count todos where completed is false. Used for the "X of Y remaining" line.
//  Uses `todos` (not `filtered`) so the count reflects the real total.
```

---

### `client/src/components/InputTodo.js`
```jsx
const InputTodo = ({ addTodo }) => {
//                   ^^^^^^^
//  addTodo is now passed in as a prop from App.js instead of
//  being defined locally. This keeps the component "dumb" —
//  it handles the form UI; App handles the data.

    const onSubmitForm = async e => {
        e.preventDefault();
        if (!description.trim()) return;
        //  Guard: don't submit if the input is empty or only spaces.
        try {
            await addTodo(description);
            //  Wait for App's addTodo to finish (server round-trip + state update).
            setDescription("");
            //  Clear the input only after success so the user sees their text
            //  if something goes wrong.
        } catch (error) { ... }
    };
```

---

### `client/src/components/ListTodos.js`
```jsx
const ListTodos = ({ todos, hasSearch, deleteTodo, updateTodo, toggleComplete }) => {
//                           ^^^^^^^^^
//  hasSearch tells us whether the user typed something in the search box.
//  Used to show a different empty-state message:
//  "No todos match your search" vs "Nothing here yet".

    const [confirmId, setConfirmId] = useState(null);
    //  Tracks which todo's Delete button is in "confirm mode".
    //  null = no confirmation showing. A todo_id = that row is asking "Sure?".

    if (todos.length === 0) {
        return <div className="empty-state">...</div>;
        //  Early return — no need to render the table at all if there's nothing to show.
    }

    // Checkbox:
    <input
        type="checkbox"
        checked={!!todo.completed}
        //        ^^  The !! converts null/undefined to false,
        //            so the checkbox doesn't become "uncontrolled".
        onChange={() => toggleComplete(todo.todo_id)}
        //  Fires immediately on click — state updates optimistically in App.js.
    />

    // Confirm-before-delete:
    {confirmId === todo.todo_id ? (
        // "Sure? Yes / No" shown inline in the cell
        <span className="confirm-delete">
            Sure?{" "}
            <button onClick={() => { deleteTodo(todo.todo_id); setConfirmId(null); }}>Yes</button>
            {" / "}
            <button onClick={() => setConfirmId(null)}>No</button>
        </span>
    ) : (
        <button onClick={() => setConfirmId(todo.todo_id)}>Delete</button>
        //  First click only sets confirmId — nothing is deleted yet.
    )}
```

---

### `client/src/components/EditTodo.js`
```jsx
const EditTodo = ({ todo, updateTodo }) => {
//                         ^^^^^^^^^^
//  Same pattern as InputTodo — the save logic lives in App.js.
//  EditTodo just handles the modal UI and local input state.

    const handleSave = async e => {
        e.preventDefault();
        await updateTodo(todo.todo_id, description);
        //  App.js updates state + calls the server.
        //  The modal closes via data-bs-dismiss="modal" on the button,
        //  which Bootstrap handles automatically.
    };
```

---

### `client/src/components/Toast.js` + `Toast.css` — new files
```jsx
// Toast.js
const Toast = ({ toasts }) => (
    <div className="toast-container">
    //  Fixed-position container in the bottom-right corner (see Toast.css).
        {toasts.map(t => (
            <div key={t.id} className={`toast-item toast-${t.type}`}>
            //                                              ^^^^^^^^
            //  type is either "success" (purple gradient) or "danger" (red).
            //  CSS classes toast-success and toast-danger set the colors.
                {t.message}
            </div>
        ))}
    </div>
);
```

```css
/* Toast.css */
.toast-container {
    position: fixed;       /* Stays in place even when the page scrolls */
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;         /* Sits on top of everything including the Bootstrap modal */
}

.toast-item {
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.9s forwards;
    /*          ^^^^^^^ slides in immediately
                                   ^^^^^^^^ starts fading out at 2.9s
                                                              ^^^^^^^^ "forwards" keeps
                                                              the final state (opacity 0)
                                                              so it doesn't snap back */
}

@keyframes toastIn {
    from { transform: translateX(110%); opacity: 0; }
    /*                ^^^^^^^^^^^^^^ starts off-screen to the right */
    to   { transform: translateX(0);    opacity: 1; }
}
```

---

### `client/src/App.css` — additions
```css
.todo-checkbox {
    accent-color: #667eea;
    /*  accent-color is a modern CSS property that tints the native
        checkbox to match the app's brand color — no custom checkbox
        markup needed. Supported in all modern browsers. */
}

.todo-done .todo-desc {
    text-decoration: line-through;
    color: #94a3b8;
    /*  Only strikes through the description cell (.todo-desc),
        not the whole row — the Edit/Delete buttons stay normal. */
}

.confirm-delete {
    white-space: nowrap;
    /*  Prevents "Sure? Yes / No" from wrapping onto two lines
        in narrow table cells. */
}

.todo-count {
    text-align: right;
    /*  Aligns "X of Y remaining" to the bottom-right of the card,
        echoing where the Delete buttons are. */
}
```
