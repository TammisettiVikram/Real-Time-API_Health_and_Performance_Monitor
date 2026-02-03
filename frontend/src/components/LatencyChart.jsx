import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function LatencyChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#3b82f6"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
