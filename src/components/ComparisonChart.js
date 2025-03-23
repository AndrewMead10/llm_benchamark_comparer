import React from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ComparisonChart = ({ results }) => {
  // Return a placeholder if results is undefined
  if (!results || !Array.isArray(results) || results.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">No data available for chart</div>;
  }

  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
  ];

  // Extract model names and metrics from results
  const modelData = results.map(result => ({
    name: result.model?.name || 'Unknown Model',
    executionTime: result.metrics?.responseTime || 0,
    costEstimate: result.metrics?.cost || 0,
    tokenCount: result.metrics?.tokensUsed || 0,
    accuracy: 3 // Default quality value
  }));

  // Normalize execution time (lower is better)
  const maxExecutionTime = Math.max(...modelData.map(model => model.executionTime || 0));
  const normalizeExecutionTime = (time) => maxExecutionTime ? 5 * (1 - (time / maxExecutionTime)) + 1 : 3;
  
  // Normalize cost (lower is better)
  const maxCost = Math.max(...modelData.map(model => model.costEstimate || 0));
  const normalizeCost = (cost) => maxCost ? 5 * (1 - (cost / maxCost)) + 1 : 3;

  // Normalize token count (lower might be better for efficiency)
  const maxTokens = Math.max(...modelData.map(model => model.tokenCount || 0));
  const normalizeTokens = (tokens) => maxTokens ? 5 * (1 - (tokens / maxTokens) * 0.5) + 1 : 3; // Partial penalty for tokens

  const data = {
    labels: ['Quality', 'Response Speed', 'Cost Efficiency', 'Provider Reliability', 'Token Efficiency'],
    datasets: modelData.map((model, index) => ({
      label: model.name,
      data: [
        model.accuracy || 3,
        normalizeExecutionTime(model.executionTime || 3),
        normalizeCost(model.costEstimate || 3),
        4.2, // Placeholder for provider reliability
        normalizeTokens(model.tokenCount || 3),
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
            const resultIndex = context.datasetIndex;
            
            if (metric === 'Response Speed') {
              const executionTime = modelData[resultIndex].executionTime;
              return `${metric}: ${value}/5 (${executionTime?.toFixed(2)}s)`;
            } else if (metric === 'Cost Efficiency') {
              const cost = modelData[resultIndex].costEstimate;
              return `${metric}: ${value}/5 ($${cost?.toFixed(6)})`;
            } else if (metric === 'Token Efficiency') {
              const tokens = modelData[resultIndex].tokenCount;
              return `${metric}: ${value}/5 (${tokens} tokens)`;
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
          Note: Provider Reliability is an estimated value based on general model characteristics. Quality is a simplified metric and may not reflect actual performance.
        </p>
      </div>
    </div>
  );
};

export default ComparisonChart; 