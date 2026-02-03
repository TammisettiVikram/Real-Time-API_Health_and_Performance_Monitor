import { useEffect, useState } from "react";
import { api } from "./api";
import ServiceCard from "./components/ServiceCard";
import AddServiceForm from "./components/AddServiceForm";
import LatencyChart from "./components/LatencyChart";

function App() {
  const [services, setServices] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [selected, setSelected] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const loadServices = () => {
    api.get("/services").then((res) => {
      setServices(Array.isArray(res.data) ? res.data : []);
    });
  };

  const deleteService = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      if (selected === id) setSelected(null);
      loadServices();
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert(
        "Delete failed. This usually means the API URL is unreachable or blocked by CORS."
      );
    }
  };

  const toggleAlerts = async (id, value) => {
    try {
      await api.patch(`/services/${id}/alerts`, {
        alert_enabled: value,
      });
      loadServices();
    } catch (err) {
      console.error("Failed to toggle alerts:", err);
      alert("Failed to update alert settings.");
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    services.forEach((s) => {
      api.get(`/stats/summary/${s.id}`).then((res) =>
        setSummaries((prev) => ({ ...prev, [s.id]: res.data }))
      );
    });
  }, [services]);

  useEffect(() => {
    if (!selected) return;
    api.get(`/stats/timeline/${selected}?hours=6`).then((res) =>
      setTimeline(res.data)
    );
  }, [selected]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">API Health Monitor</h1>

      <AddServiceForm onAdded={loadServices} />

      <div className="p-4 text-white bg-gray-800">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            summary={summaries[s.id]}
            onSelect={() => setSelected(s.id)}
            onDelete={deleteService}
            onToggleAlerts={toggleAlerts}
          />
        ))}
      </div>

      {selected && (
        <div>
          <h2 className="text-xl font-semibold mt-6">Latency</h2>
          <LatencyChart data={timeline} />
        </div>
      )}
    </div>
  );
}

export default App;
