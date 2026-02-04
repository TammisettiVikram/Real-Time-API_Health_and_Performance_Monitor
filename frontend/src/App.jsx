import { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

import ServiceCard from "./components/ServiceCard";
import StatsBar from "./components/statsBar";
import AddServiceForm from "./components/AddServiceForm";

export default function App() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const LATENCY_WARN_MS = 800;
  const FAILURE_DEGRADED = 3;
  const FAILURE_DOWN = 5;
  const TIMELINE_HOURS = 24;
  const TIMELINE_LIMIT = 10;

  function computeServiceState(consecutiveFailures, avgLatency) {
    if (consecutiveFailures >= FAILURE_DOWN) {
      return { label: "Down", tone: "down" };
    }
    if (consecutiveFailures >= FAILURE_DEGRADED) {
      return { label: "Degraded", tone: "warn" };
    }
    if (typeof avgLatency === "number" && avgLatency > LATENCY_WARN_MS) {
      return { label: "Degraded", tone: "warn" };
    }
    return { label: "Healthy", tone: "healthy" };
  }

  function computeLastRecovery(timeline) {
    if (!Array.isArray(timeline) || timeline.length < 2) {
      return null;
    }

    for (let i = timeline.length - 1; i > 0; i -= 1) {
      const current = timeline[i];
      const previous = timeline[i - 1];
      if (current?.is_up && previous && !previous.is_up) {
        return current.time;
      }
    }

    return null;
  }

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
            Promise.all([
              api.get(`/stats/summary/${service.id}`),
              api.get(`/stats/timeline/${service.id}?hours=${TIMELINE_HOURS}`),
            ])
              .then(([summaryRes, timelineRes]) => ({
                id: service.id,
                service,
                summary: summaryRes.data,
                timeline: timelineRes.data,
              }))
              .catch((error) => ({ id: service.id, service, error }))
          )
        );

        if (cancelled) return;

        const per_service = {};
        let totalUptime = 0;
        let uptimeCount = 0;
        let totalLatency = 0;
        let latencyCount = 0;

        results.forEach((result) => {
          if (!result.summary) return;

          const uptime = result.summary.uptime_percent;
          const avgLatency = result.summary.avg_latency_ms;
          const timeline = Array.isArray(result.timeline) ? result.timeline : [];
          const lastChecks = timeline.slice(-TIMELINE_LIMIT);
          const lastRecovery = computeLastRecovery(timeline);
          const consecutiveFailures = result.service?.consecutive_failures ?? 0;
          const state = computeServiceState(consecutiveFailures, avgLatency);

          per_service[result.id] = {
            uptime,
            avg_latency: avgLatency,
            is_up: typeof uptime === "number" ? uptime >= 99 : true,
            last_checks: lastChecks,
            last_recovery: lastRecovery,
            state,
            latency_threshold: LATENCY_WARN_MS,
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
          <p className="app-eyebrow">A Backend Reliability & Observability Engine</p>
          <h1 className="app-title">SentinelCore</h1>
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
