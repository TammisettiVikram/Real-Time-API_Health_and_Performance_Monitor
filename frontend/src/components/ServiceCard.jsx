export default function ServiceCard({
    service,
    stats,
    onToggleAlerts,
    onDelete,
}) {
    const isUp = stats?.is_up ?? true;

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

            {service.consecutive_failures > 0 && (
                <div className="failure-note">
                    Warning: {service.consecutive_failures} consecutive failures
                </div>
            )}

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
