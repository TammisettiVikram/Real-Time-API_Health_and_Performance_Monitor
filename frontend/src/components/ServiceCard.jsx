export default function ServiceCard({ service, summary, onSelect, onDelete }) {
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

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(service.id);
          }}
          className="text-red-400 hover:text-red-600 text-sm mt-3"
        >
          Delete
        </button>
      )}
    </div>
  );
}
