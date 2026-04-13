import React, { Fragment, useState } from "react";

const EditTodo = ({ todo, updateTodo }) => {
    const [description, setDescription] = useState(todo.description);

    const handleSave = async e => {
        e.preventDefault();
        try {
            await updateTodo(todo.todo_id, description);
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <Fragment>
            <button
                type="button"
                className="btn btn-warning"
                data-bs-toggle="modal"
                data-bs-target={`#id${todo.todo_id}`}>
                Edit
            </button>

            <div
                className="modal"
                id={`id${todo.todo_id}`}
                onClick={() => setDescription(todo.description)}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Todo</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                onClick={() => setDescription(todo.description)}>
                            </button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-success"
                                data-bs-dismiss="modal"
                                onClick={handleSave}>
                                Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                onClick={() => setDescription(todo.description)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default EditTodo;
