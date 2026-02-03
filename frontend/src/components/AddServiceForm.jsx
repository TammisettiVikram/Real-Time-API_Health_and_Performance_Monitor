import { useState } from "react";

export default function AddServiceForm({ onAdd }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        if (!name || !url) return;

        onAdd({ name, url });
        setName("");
        setUrl("");
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="form-card reveal"
        >
            <div className="form-header">
                <h2>Add New Service</h2>
                <p>Monitor any public health or status endpoint.</p>
            </div>

            <div className="form-grid">
                <input
                    type="text"
                    placeholder="Service name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="url"
                    placeholder="https://example.com/health"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <button type="submit">Add Service</button>
            </div>
        </form>
    );
}
