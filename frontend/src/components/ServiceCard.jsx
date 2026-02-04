export default function ServiceCard({
    service,
    stats,
    onToggleAlerts,
    onDelete,
}) {
    const isUp = stats?.is_up ?? true;
    const state = stats?.state ?? { label: "Healthy", tone: "healthy" };
    const lastChecks = stats?.last_checks ?? [];
    const lastRecovery = stats?.last_recovery;
    const latencyThreshold = stats?.latency_threshold ?? 800;

    const stateLabel = (() => {
        if (state.label === "Down") return "🔴 Down";
        if (state.label === "Degraded") return "🟡 Degraded";
        return "🟢 Healthy";
    })();

    const formattedRecovery = lastRecovery
        ? new Date(lastRecovery).toLocaleString()
        : "No recovery yet";

    return (
        <div className="service-card reveal">
            <div className="service-top">
                <div>
                    <h2 className="service-name">{service.name}</h2>
                    <p className="service-url">{service.url}</p>
                </div>

                <span className={`status-pill ${isUp ? "status-up" : "status-down"}`}>
                    {isUp ? "UP" : "DOWN"}
                </span>
            </div>

            <div className="service-metrics">
                <div>
                    <p className="metric-label">Uptime</p>
                    <p className="metric-value">{stats?.uptime ?? 0}%</p>
                </div>

                <div>
                    <p className="metric-label">Avg Latency</p>
                    <p className="metric-value">{stats?.avg_latency ?? 0} ms</p>
                </div>
            </div>

            <div className="service-state">
                <p className="metric-label">🔥 Service State</p>
                <div className={`state-pill state-${state.tone}`}>
                    {stateLabel}
                </div>
                <p className="state-note">
                    Threshold: {latencyThreshold} ms latency, 3/5 failure streaks
                </p>
            </div>

            <div className="failure-grid">
                <div>
                    <p className="metric-label">Consecutive Failures (0 / 3 / 5)</p>
                    <p className="metric-value">{service.consecutive_failures ?? 0}</p>
                </div>
                <div>
                    <p className="metric-label">Last Recovery</p>
                    <p className="metric-value">{formattedRecovery}</p>
                </div>
            </div>

            <div className="timeline-block">
                <p className="metric-label">Last 10 Checks</p>
                {lastChecks.length === 0 ? (
                    <p className="timeline-empty">No recent checks yet.</p>
                ) : (
                    <div className="timeline-row">
                        {lastChecks.map((check, index) => (
                            <div
                                key={`${service.id}-check-${index}`}
                                className={`check-chip ${check.is_up ? "check-up" : "check-down"
                                    }`}
                            >
                                <span>{check.is_up ? "UP" : "DOWN"}</span>
                                <span>{check.is_up ? `${check.latency ?? 0} ms` : "--"}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="service-actions">
                <button
                    onClick={() => onToggleAlerts(service.id, !service.alert_enabled)}
                    className={`toggle-btn ${service.alert_enabled ? "toggle-on" : "toggle-off"
                        }`}
                >
                    {service.alert_enabled ? "Alerts ON" : "Alerts OFF"}
                </button>

                <button onClick={() => onDelete(service.id)} className="delete-btn">
                    Delete
                </button>
            </div>
        </div>
    );
}
