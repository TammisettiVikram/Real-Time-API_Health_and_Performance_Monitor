import { useState } from "react";
import { api } from "../api";

export default function AddServiceForm({ onAdded }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/services", { name, url });
            setName("");
            setUrl("");
            onAdded(); // refresh services
        } catch (err) {
            alert("Failed to add service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="bg-gray-800 p-4 rounded space-y-3 text-white"
        >
            <h2 className="font-semibold">Add New Service</h2>

            <input
                className="w-full p-2 rounded bg-gray-700"
                placeholder="Service name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <input
                className="w-full p-2 rounded bg-gray-700"
                placeholder="https://example.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
            />

            <button
                className="bg-blue-600 px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Service"}
            </button>
        </form>
    );
}
