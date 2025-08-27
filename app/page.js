"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import parseNumber from "@/utils/parserInt";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
export default function Home() {
  const [data, setData] = useState(null);
  const [chart, setChart] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/gold");
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error("Error fetching API:", err);
    }
  };

  const fetchChart = async () => {
    try {
      const res = await fetch("/api/chart", { cache: "force-cache" });
      const json = await res.json();
      setChart(json.data);
      console.log("Chart data fetched:", typeof json.data);
    } catch (err) {
      console.error("Error fetching API:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchChart();
  }, []);

  console.log("Fetched data:", data);

  const chartData = useMemo(
    () =>
      chart?.["Mua vào"]?.map((item, idx) => ({
        date: item.date,
        mua: item.value,
        ban: chart?.["Bán ra"]?.[idx]?.value ?? null,
      })) || [],
    [chart]
  );

  if (!data) return <p>Loading...</p>;

  return (
    <div
      className="p-4"
      style={{
        display: "flex",
        gap: "2rem",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        className="overflow-x-auto"
        style={{ minWidth: "600px", height: "100%", flex: 1 }}
      >
        <h1 className="text-2xl font-bold mb-4">Giá Vàng Hôm Nay</h1>
        <Table className="border border-gray-300 min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nhà vàng</TableHead>
              <TableHead>Today Buy</TableHead>
              <TableHead>Today Sell</TableHead>
              <TableHead>Yesterday Buy</TableHead>
              <TableHead>Yesterday Sell</TableHead>
              <TableHead>Buy Diff</TableHead>
              <TableHead>Sell Diff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.goldData?.length > 0 ? (
              data.goldData.map((item) => {
                const buyDiff =
                  parseNumber(item?.today?.buy) -
                  parseNumber(item?.yesterday?.buy);
                const sellDiff =
                  parseNumber(item?.today?.sell) -
                  parseNumber(item?.yesterday?.sell);

                return (
                  <TableRow key={item?.name || Math.random()}>
                    <TableCell>{item?.name || "N/A"}</TableCell>
                    <TableCell>{item?.today?.buy || "-"}</TableCell>
                    <TableCell>{item?.today?.sell || "-"}</TableCell>
                    <TableCell>{item?.yesterday?.buy || "-"}</TableCell>
                    <TableCell>{item?.yesterday?.sell || "-"}</TableCell>
                    <TableCell
                      className={
                        buyDiff > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {buyDiff > 0 ? `+${buyDiff}` : buyDiff}
                    </TableCell>
                    <TableCell
                      className={
                        sellDiff > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {sellDiff > 0 ? `+${sellDiff}` : sellDiff}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minWidth: "600px" }}>
        <Card className="p-4">
          <h2
            className="text-xl font-bold mb-4"
            style={{ textAlign: "center" }}
          >
            Biểu đồ Giá Vàng
          </h2>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis
                  tickFormatter={(v) => `${v / 1_000_000}M`}
                  domain={[118_000_000, 130_000_000]}
                  ticks={[
                    118_000_000, 120_000_000, 122_000_000, 124_000_000,
                    126_000_000, 128_000_000, 130_000_000,
                  ]}
                />
                <Tooltip formatter={(v) => v.toLocaleString("vi-VN")} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mua"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Mua vào"
                />
                <Line
                  type="monotone"
                  dataKey="ban"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Bán ra"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
