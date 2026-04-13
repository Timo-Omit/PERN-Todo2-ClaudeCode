# Frontend Styling Update

## Overview
Visual overhaul of the PERN Todo app frontend. All changes are purely presentational or minor bug fixes — no backend logic was touched.

---

## Files Changed

### `client/public/index.html`
- Added Google Fonts import for **Inter** (weights 300–700) for modern, clean typography
- Changed `<title>` from `React App` to `PERN Todo`

---

### `client/src/index.css`
- Set `body` background to a purple-to-indigo gradient (`#667eea` → `#764ba2`)
- Set `min-height: 100vh` on both `body` and `#root` so the gradient fills the full page

---

### `client/src/App.css`
Complete rewrite. Replaced the default CRA boilerplate with app-specific styles:

| Selector | What changed |
|---|---|
| `.app-title` | White bold heading with text-shadow, floats above the card |
| `.todo-card` | White card with `border-radius: 18px` and a deep box-shadow |
| `.form-control` | Rounded border, thicker border on focus with brand-color glow |
| `.btn-success` | Replaced Bootstrap green with a gradient matching the page background |
| `.btn-warning` | Amber fill, white text, hover lift + shadow |
| `.btn-danger` | Red fill, hover lift + shadow |
| `.table` | Separated row spacing, uppercase small-caps headers in slate gray |
| `.table tbody tr:hover` | Subtle `#f8fafc` row highlight on hover |
| `.modal-content` | Rounded modal (18px), no border, large shadow |
| `.modal-header / footer` | Lighter divider color (`#f1f5f9`), tightened padding |

---

### `client/src/App.js`
- Moved the page title (`<h1>`) out of `InputTodo` and into `App` so it sits above the card
- Wrapped `<InputTodo />` and `<ListTodos />` together inside a `<div className="todo-card">`
- Set `maxWidth: 700` on the container to keep the layout readable on wide screens

---

### `client/src/components/InputTodo.js`
- Removed the `<h1>` (title moved to `App.js`)
- Removed `mt-5` from the form (spacing now handled by the card)
- Added `placeholder="Add a new todo..."` to the input
- Added `ms-2` to the Add button for consistent spacing

---

### `client/src/components/ListTodos.js`
**Bug fix:** All `class=` attributes changed to `className=` — React was silently ignoring them, so Bootstrap styles weren't being applied to the table.

- Removed stray `console.log(todos)` that was left in the render body
- Table header labels changed from ALL-CAPS strings to title-case (`Description`, `Edit`, `Delete`) — CSS handles the visual uppercase transform
- Delete button label changed from `DELETE` to `Delete` for consistency

---

### `client/src/components/EditTodo.js`
**Bug fix:** All `class=` attributes changed to `className=` (same issue as ListTodos).

- Added `modal-dialog-centered` so the modal appears in the middle of the viewport instead of near the top
- Removed the `&times;` character from the close button — Bootstrap's `.btn-close` renders its own X icon
- Edit modal footer: "Edit" button renamed to **Save** and given `.btn-success` styling; "Close" button renamed to **Cancel** and now also resets the input field on dismiss
