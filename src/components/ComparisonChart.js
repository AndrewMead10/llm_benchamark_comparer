import React from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ComparisonChart = ({ models }) => {
  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
  ];

  // Normalize execution time (lower is better)
  const maxExecutionTime = Math.max(...models.map(model => model.executionTime || 0));
  const normalizeExecutionTime = (time) => maxExecutionTime ? 5 * (1 - (time / maxExecutionTime)) + 1 : 3;
  
  // Normalize cost (lower is better)
  const maxCost = Math.max(...models.map(model => model.costEstimate || 0));
  const normalizeCost = (cost) => maxCost ? 5 * (1 - (cost / maxCost)) + 1 : 3;

  const data = {
    labels: ['Quality', 'Speed', 'Cost Efficiency', 'Provider Reliability', 'Feature Coverage'],
    datasets: models.map((model, index) => ({
      label: model.name || 'Unknown Model',
      data: [
        model.accuracy || 3,
        normalizeExecutionTime(model.executionTime || 3),
        normalizeCost(model.costEstimate || 3),
        4.2, // Placeholder for provider reliability
        4.0, // Placeholder for feature coverage
      ],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace('0.6', '1'),
      borderWidth: 1,
    })),
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          display: false,
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return context[0].dataset.label;
          },
          label: function(context) {
            const metric = context.chart.data.labels[context.dataIndex];
            let value = context.raw.toFixed(1);
            
            if (metric === 'Speed') {
              const executionTime = models[context.datasetIndex].executionTime;
              return `${metric}: ${value}/5 (${executionTime?.toFixed(2)}s)`;
            } else if (metric === 'Cost Efficiency') {
              const cost = models[context.datasetIndex].costEstimate;
              return `${metric}: ${value}/5 ($${cost?.toFixed(4)})`;
            }
            
            return `${metric}: ${value}/5`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Comparison</h3>
      <div className="h-80">
        <Radar data={data} options={options} />
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500 italic">
          Note: Provider Reliability and Feature Coverage are estimated values based on general model characteristics.
        </p>
      </div>
    </div>
  );
};

export default ComparisonChart; 