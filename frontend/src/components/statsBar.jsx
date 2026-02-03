export default function StatsBar({
    totalServices,
    avgUptime,
    avgLatency,
}) {
    return (
        <div className="stats-grid">
            <div className="stat-card">
                <p className="stat-label">Services</p>
                <p className="stat-value">{totalServices}</p>
                <p className="stat-foot">Active monitors</p>
            </div>

            <div className="stat-card">
                <p className="stat-label">Avg Uptime</p>
                <p className="stat-value">{avgUptime}%</p>
                <p className="stat-foot">Last 24 hours</p>
            </div>

            <div className="stat-card">
                <p className="stat-label">Avg Latency</p>
                <p className="stat-value">{avgLatency} ms</p>
                <p className="stat-foot">Healthy baseline</p>
            </div>
        </div>
    );
}
