import React, { Fragment, useState } from "react";

const InputTodo = ({ addTodo }) => {
    const [description, setDescription] = useState("");

    const onSubmitForm = async e => {
        e.preventDefault();
        if (!description.trim()) return;
        try {
            await addTodo(description);
            setDescription("");
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <Fragment>
            <form className="d-flex mb-3" onSubmit={onSubmitForm}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Add a new todo..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <button className="btn btn-success ms-2">Add</button>
            </form>
        </Fragment>
    );
};

export default InputTodo;
