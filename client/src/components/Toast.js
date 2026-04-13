import React from "react";
import "./Toast.css";

const Toast = ({ toasts }) => (
    <div className="toast-container">
        {toasts.map(t => (
            <div key={t.id} className={`toast-item toast-${t.type}`}>
                {t.message}
            </div>
        ))}
    </div>
);

export default Toast;
