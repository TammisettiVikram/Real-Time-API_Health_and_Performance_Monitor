export default function ServiceCard({
  service,
  summary,
  onSelect,
  onDelete,
  onToggleAlerts,
}) {
  const up = summary?.uptime_percent === 100;

  return (
    <div
      onClick={onSelect}
      className="border rounded p-4 cursor-pointer hover:shadow text-white bg-gray-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-white">{service.name}</h3>
          <p className={up ? "text-green-400" : "text-red-400"}>
            {up ? "UP" : "DEGRADED"}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-sm ${
            up ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {up ? "UP" : "DOWN"}
        </span>
      </div>

      <p className="text-gray-300">Uptime: {summary?.uptime_percent ?? "-"}%</p>
      <p className="text-gray-300">
        Avg latency: {summary?.avg_latency_ms ?? "-"} ms
      </p>

      {service?.consecutive_failures >= 3 && (
        <div className="mt-2 text-sm text-red-400 font-semibold">
          🚨 Possible outage detected
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        {onToggleAlerts && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAlerts(service.id, !service.alert_enabled);
            }}
            className={`px-3 py-1 text-xs rounded ${
              service.alert_enabled ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            {service.alert_enabled ? "Alerts ON" : "Alerts OFF"}
          </button>
        )}

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(service.id);
            }}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
