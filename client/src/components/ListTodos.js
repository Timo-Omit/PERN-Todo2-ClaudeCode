import React, { Fragment, useState } from "react";
import EditTodo from "./EditTodo";

const ListTodos = ({ todos, hasSearch, deleteTodo, updateTodo, toggleComplete }) => {
    const [confirmId, setConfirmId] = useState(null);

    if (todos.length === 0) {
        return (
            <div className="empty-state">
                {hasSearch
                    ? "No todos match your search."
                    : "Nothing here yet — add your first todo above!"}
            </div>
        );
    }

    return (
        <Fragment>
            <table className="table mt-3 text-center">
                <thead>
                    <tr>
                        <th style={{ width: 44 }}></th>
                        <th className="text-start">Description</th>
                        <th style={{ width: 80 }}>Edit</th>
                        <th style={{ width: 110 }}>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {todos.map(todo => (
                        <tr key={todo.todo_id} className={todo.completed ? "todo-done" : ""}>
                            <td>
                                <input
                                    type="checkbox"
                                    className="todo-checkbox"
                                    checked={!!todo.completed}
                                    onChange={() => toggleComplete(todo.todo_id)}
                                />
                            </td>
                            <td className="text-start todo-desc">{todo.description}</td>
                            <td>
                                <EditTodo todo={todo} updateTodo={updateTodo} />
                            </td>
                            <td>
                                {confirmId === todo.todo_id ? (
                                    <span className="confirm-delete">
                                        Sure?{" "}
                                        <button
                                            className="btn-link-danger"
                                            onClick={() => { deleteTodo(todo.todo_id); setConfirmId(null); }}>
                                            Yes
                                        </button>
                                        {" / "}
                                        <button
                                            className="btn-link-cancel"
                                            onClick={() => setConfirmId(null)}>
                                            No
                                        </button>
                                    </span>
                                ) : (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => setConfirmId(todo.todo_id)}>
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
    );
};

export default ListTodos;
