import { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

import ServiceCard from "./components/ServiceCard";
import StatsBar from "./components/statsBar";
import AddServiceForm from "./components/AddServiceForm";

export default function App() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});

  async function fetchServices() {
    const res = await api.get("/services");
    setServices(res.data);
  }

  async function addService(data) {
    await api.post("/services", data);
    fetchServices();
  }

  async function deleteService(id) {
    await api.delete(`/services/${id}`);
    fetchServices();
  }

  async function toggleAlerts(id, value) {
    await api.patch(`/services/${id}/alerts`, {
      alert_enabled: value,
    });
    fetchServices();
  }

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length === 0) {
      setStats({});
      return;
    }

    let cancelled = false;

    async function loadSummaries() {
      try {
        const results = await Promise.all(
          services.map((service) =>
            api
              .get(`/stats/summary/${service.id}`)
              .then((res) => ({ id: service.id, data: res.data }))
              .catch((error) => ({ id: service.id, error }))
          )
        );

        if (cancelled) return;

        const per_service = {};
        let totalUptime = 0;
        let uptimeCount = 0;
        let totalLatency = 0;
        let latencyCount = 0;

        results.forEach((result) => {
          if (!result.data) return;

          const uptime = result.data.uptime_percent;
          const avgLatency = result.data.avg_latency_ms;

          per_service[result.id] = {
            uptime,
            avg_latency: avgLatency,
            is_up: typeof uptime === "number" ? uptime >= 99 : true,
          };

          if (typeof uptime === "number") {
            totalUptime += uptime;
            uptimeCount += 1;
          }

          if (typeof avgLatency === "number") {
            totalLatency += avgLatency;
            latencyCount += 1;
          }
        });

        setStats({
          avg_uptime: uptimeCount
            ? Number((totalUptime / uptimeCount).toFixed(2))
            : 0,
          avg_latency: latencyCount
            ? Math.round(totalLatency / latencyCount)
            : 0,
          per_service,
        });
      } catch (error) {
        console.error("Failed to load service summaries:", error);
      }
    }

    loadSummaries();

    return () => {
      cancelled = true;
    };
  }, [services]);

  return (
    <div className="app-shell">
      <header className="app-hero">
        <div>
          <p className="app-eyebrow">Real-Time Observability</p>
          <h1 className="app-title">API Health Monitor</h1>
          <p className="app-subtitle">
            Track uptime, latency, and alert readiness with a single glance.
          </p>
        </div>
        <div className="app-hero-badge">
          <span className="dot" />
          Live checks
        </div>
      </header>

      <section className="section reveal">
        <StatsBar
          totalServices={services.length}
          avgUptime={stats.avg_uptime ?? 0}
          avgLatency={stats.avg_latency ?? 0}
        />
      </section>

      <section className="section reveal">
        <AddServiceForm onAdd={addService} />
      </section>

      {services.length === 0 && (
        <div className="empty-state reveal">
          <h3>No services yet</h3>
          <p>
            Add your first API endpoint to start collecting uptime and latency
            data.
          </p>
        </div>
      )}

      <section className="cards-grid">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            stats={stats.per_service?.[service.id]}
            onToggleAlerts={toggleAlerts}
            onDelete={deleteService}
          />
        ))}
      </section>
    </div>
  );
}
