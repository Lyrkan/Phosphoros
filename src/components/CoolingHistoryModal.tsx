import { useState, useMemo } from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/RootStore';
import { CoolingMetric } from '../stores/CoolingHistoryStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Chart,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  show: boolean;
  onHide: () => void;
  metric: CoolingMetric;
}

const PERIOD_LABELS = ['1 minute', '5 minutes', '1 hour'];

const CoolingHistoryModal = observer(({ show, onHide, metric }: Props) => {
  const { coolingHistoryStore, settingsStore } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const data = coolingHistoryStore.getHistory(metric, selectedPeriod);

  const getMetricLabel = (metric: CoolingMetric): string => {
    switch (metric) {
      case CoolingMetric.InputFlow:
        return 'Input Flow (L/min)';
      case CoolingMetric.OutputFlow:
        return 'Output Flow (L/min)';
      case CoolingMetric.InputTemperature:
        return 'Input Temperature (°C)';
      case CoolingMetric.OutputTemperature:
        return 'Output Temperature (°C)';
    }
  };

  const formatTime = (timestamp: number): string => {
    return format(timestamp, 'HH:mm:ss');
  };

  const getMetricLimits = (metric: CoolingMetric) => {
    const isFlow = metric === CoolingMetric.InputFlow || metric === CoolingMetric.OutputFlow;
    return {
      min: isFlow ? settingsStore.probes.cooling?.flow?.min : settingsStore.probes.cooling?.temp?.min,
      max: isFlow ? settingsStore.probes.cooling?.flow?.max : settingsStore.probes.cooling?.temp?.max
    };
  };

  const limits = getMetricLimits(metric);

  const chartData: ChartData<'line'> = {
    labels: data.map(point => formatTime(point.timestamp)),
    datasets: [
      {
        label: getMetricLabel(metric),
        data: data.map(point => point.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      ...(limits.min !== undefined ? [{
        label: 'Minimum',
        data: Array(data.length).fill(limits.min),
        borderColor: 'rgba(99, 135, 255, 0.8)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      }] : []),
      ...(limits.max !== undefined ? [{
        label: 'Maximum',
        data: Array(data.length).fill(limits.max),
        borderColor: 'rgba(255, 99, 132, 0.8)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      }] : [])
    ]
  };

  const drawBackgroundZones = (chart: Chart) => {
    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;

    if (!ctx || !xAxis || !yAxis || !data.length) return;

    // Get chart area bounds
    const chartArea = chart.chartArea;
    if (!chartArea) return;

    ctx.save();

    let zoneStart: number | null = null;

    // Helper to draw a zone from start to end index
    const drawZone = (startIdx: number, endIdx: number) => {
      // Calculate positions based on chart area and data indices
      const totalPoints = data.length - 1; // -1 because we want gaps between points
      const pointWidth = (chartArea.right - chartArea.left) / totalPoints;

      const startX = chartArea.left + (startIdx * pointWidth);
      const endX = chartArea.left + ((endIdx + 1) * pointWidth);

      // Draw the zone
      ctx.fillStyle = 'rgba(255, 193, 7, 0.2)';
      ctx.fillRect(
        startX,
        chartArea.top,
        endX - startX,
        chartArea.bottom - chartArea.top
      );
    };

    // Iterate through data points to find continuous laser running zones
    data.forEach((point, index) => {
      if (point.isLaserRunning) {
        if (zoneStart === null) {
          zoneStart = index;
        }
      } else if (zoneStart !== null) {
        // End of a zone
        drawZone(zoneStart, index - 1);
        zoneStart = null;
      }
    });

    // Handle case where laser is still running at the end
    if (zoneStart !== null) {
      drawZone(zoneStart, data.length - 1);
    }

    ctx.restore();
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: getMetricLabel(metric)
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          afterBody: (context: TooltipItem<'line'>[]) => {
            const dataPoint = data[context[0].dataIndex];
            if (dataPoint?.isLaserRunning) {
              return 'Laser Running';
            }
            return undefined;
          }
        }
      }
    }
  };

  // Force chart update when data changes
  const chartKey = useMemo(() => JSON.stringify(data.map(d => d.isLaserRunning)), [data]);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-graph-up me-2"></i>{getMetricLabel(metric)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <ButtonGroup>
            {PERIOD_LABELS.map((label, index) => (
              <Button
                key={label}
                variant={selectedPeriod === index ? 'primary' : 'outline-primary'}
                onClick={() => setSelectedPeriod(index)}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div style={{ height: '400px' }}>
          <Line
            key={chartKey}
            data={chartData}
            options={chartOptions}
            plugins={[{
              id: 'backgroundZones',
              beforeDraw: drawBackgroundZones
            }]}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
});

export default CoolingHistoryModal;

