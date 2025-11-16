import React, { useState, useRef, useEffect } from 'react';

const EnhancedChartComponent = () => {
  const canvasRef = useRef(null);
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  });

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'pie', name: 'Pie Chart', icon: '🥧' },
    { id: 'doughnut', name: 'Doughnut', icon: '🍩' },
    { id: 'area', name: 'Area Chart', icon: '📉' },
    { id: 'scatter', name: 'Scatter Plot', icon: '⚫' }
  ];

  useEffect(() => {
    drawChart();
  }, [chartType, chartData]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up chart area
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const data = chartData.datasets[0].data;
    const labels = chartData.labels;
    const colors = chartData.datasets[0].backgroundColor;
    
    switch (chartType) {
      case 'bar':
        drawBarChart(ctx, data, labels, colors, padding, chartWidth, chartHeight);
        break;
      case 'line':
        drawLineChart(ctx, data, labels, padding, chartWidth, chartHeight);
        break;
      case 'pie':
        drawPieChart(ctx, data, labels, colors, width / 2, height / 2, Math.min(chartWidth, chartHeight) / 3);
        break;
      case 'doughnut':
        drawDoughnutChart(ctx, data, labels, colors, width / 2, height / 2, Math.min(chartWidth, chartHeight) / 3);
        break;
      case 'area':
        drawAreaChart(ctx, data, labels, padding, chartWidth, chartHeight);
        break;
      case 'scatter':
        drawScatterChart(ctx, data, labels, padding, chartWidth, chartHeight);
        break;
    }
  };

  const drawBarChart = (ctx, data, labels, colors, padding, chartWidth, chartHeight) => {
    const maxValue = Math.max(...data);
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing);
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw labels
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, padding + chartHeight + 20);
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
    });
  };

  const drawLineChart = (ctx, data, labels, padding, chartWidth, chartHeight) => {
    const maxValue = Math.max(...data);
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - (value / maxValue) * chartHeight
    }));

    // Draw line
    ctx.strokeStyle = '#36A2EB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();

    // Draw points
    points.forEach((point, index) => {
      ctx.fillStyle = '#36A2EB';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], point.x, padding + chartHeight + 20);
    });
  };

  const drawPieChart = (ctx, data, labels, colors, centerX, centerY, radius) => {
    const total = data.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw labels
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${labels[index]}: ${value}`, labelX, labelY);

      currentAngle += sliceAngle;
    });
  };

  const drawDoughnutChart = (ctx, data, labels, colors, centerX, centerY, radius) => {
    const total = data.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2;
    const innerRadius = radius * 0.5;

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Total', centerX, centerY - 5);
    ctx.fillText(total.toString(), centerX, centerY + 15);
  };

  const drawAreaChart = (ctx, data, labels, padding, chartWidth, chartHeight) => {
    const maxValue = Math.max(...data);
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - (value / maxValue) * chartHeight
    }));

    // Draw filled area
    ctx.fillStyle = 'rgba(54, 162, 235, 0.3)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding + chartHeight);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#36A2EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();
  };

  const drawScatterChart = (ctx, data, labels, padding, chartWidth, chartHeight) => {
    const maxValue = Math.max(...data);
    
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;
      
      ctx.fillStyle = '#FF6384';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
    window.dispatchEvent(new CustomEvent('insertChart', { detail: type }));
  };

  const handleDataEdit = () => {
    const newDataString = prompt('Edit chart data (JSON format):', JSON.stringify(chartData, null, 2));
    if (newDataString) {
      try {
        const newData = JSON.parse(newDataString);
        setChartData(newData);
      } catch (error) {
        alert('Invalid JSON format');
      }
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Charts & Graphs
      </h3>

      {/* Chart Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Chart Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleChartTypeChange(type.id)}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                chartType === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {type.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Preview
        </label>
        <div className="bg-white dark:bg-gray-700 border rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={280}
            height={200}
            className="w-full"
          />
        </div>
      </div>

      {/* Data Controls */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Data Management
        </label>
        <div className="space-y-2">
          <button
            onClick={handleDataEdit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📝 Edit Data
          </button>
          <button
            onClick={() => setChartData({
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [{
                label: 'Revenue',
                data: [25, 30, 45, 60],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
              }]
            })}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Sample Data
          </button>
        </div>
      </div>

      {/* Current Data Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Data
        </label>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-xs">
          <div className="font-medium mb-2">Labels: {chartData.labels.join(', ')}</div>
          <div className="font-medium">Values: {chartData.datasets[0].data.join(', ')}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
          📊 Chart Instructions
        </h4>
        <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
          <li>• Select chart type from grid above</li>
          <li>• Click "Edit Data" to modify values</li>
          <li>• Use JSON format for data editing</li>
          <li>• Charts update in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedChartComponent;