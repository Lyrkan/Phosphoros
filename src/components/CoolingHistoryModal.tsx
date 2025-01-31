import { useState } from 'react';
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
  ChartOptions
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

  const chartData = {
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
      }
    }
  };

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
          <Line data={chartData} options={chartOptions} />
        </div>
      </Modal.Body>
    </Modal>
  );
});

export default CoolingHistoryModal;

