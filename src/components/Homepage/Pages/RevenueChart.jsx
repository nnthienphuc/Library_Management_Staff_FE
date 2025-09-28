import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

export default function RevenueChart({ dataByMonth }) {
  const labels = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Doanh thu theo tháng (VNĐ)",
        data: labels.map((_, index) => dataByMonth[index + 1] || 0),
        backgroundColor: "#4bc0c0",
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#000",
        formatter: function (value) {
          if (value === 0) return "";
          return value.toLocaleString("vi-VN") + " ₫";
        },
        font: {
          weight: "bold"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("vi-VN") + " ₫";
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
}
