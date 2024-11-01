import { Card, ProgressBar, Row, Col, Badge } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/RootStore";
import CardHeader from "../components/CardHeader";
import { LaserState, AlarmState, LidState, FlameSensorStatus, UartStatus } from "../types/Stores";

const Status = observer(() => {
  const { laserStore, lidsStore, coolingStore, systemStore, serialStore, settingsStore } = useStore();

  const gridStyle = {
    gridAutoRows: '1fr'
  };

  const progressBarContainerStyle = {
    height: '2rem',
    fontSize: '1rem',
    position: 'relative' as const,
  };

  const progressLabelStyle = {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    zIndex: 1,
  };

  const progressBarStyle = {
    height: '100%',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    margin: 0,
  };

  const getLaserStateBadge = (state: LaserState): string => {
    switch (state) {
      case LaserState.Idle:
      case LaserState.Jog:
        return 'success';
      case LaserState.Hold:
      case LaserState.HoldComplete:
      case LaserState.Door:
      case LaserState.DoorHold:
      case LaserState.DoorResume:
      case LaserState.DoorRestart:
      case LaserState.Check:
      case LaserState.Run:
      case LaserState.Unknown:
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getAlarmStateBadge = (state: AlarmState): string => {
    switch (state) {
      case AlarmState.NoAlarm:
        return 'success';
      case AlarmState.Unknown:
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getLidStateBadge = (state: LidState): string => {
    switch (state) {
      case LidState.Closed:
        return 'success';
      case LidState.Unknown:
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getFlameSensorBadge = (state: FlameSensorStatus): string => {
    switch (state) {
      case FlameSensorStatus.OK:
        return 'success';
      case FlameSensorStatus.Unknown:
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getUartStatusBadge = (state: UartStatus): string => {
    switch (state) {
      case UartStatus.Connected:
        return 'success';
      case UartStatus.Unknown:
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getSerialConnectionBadge = (state: UartStatus): string => {
    switch (state) {
      case UartStatus.Connected:
        return 'success';
      case UartStatus.Unknown:
        return 'warning';
      default:
        return 'danger';
    }
  };

  const isPanelOk = {
    fluidnc: (currentState: LaserState, alarmState: AlarmState): boolean => {
      return (currentState === LaserState.Idle || currentState === LaserState.Jog) &&
             alarmState === AlarmState.NoAlarm;
    },

    lids: (frontLidState: LidState, backLidState: LidState): boolean => {
      return frontLidState === LidState.Closed &&
             backLidState === LidState.Closed;
    },

    cooling: (
      inputFlow: number,
      outputFlow: number,
      inputTemperature: number,
      outputTemperature: number
    ): boolean => {
      const { probes } = settingsStore;
      return inputFlow >= (probes.cooling?.flow?.min ?? 3) &&
             outputFlow >= (probes.cooling?.flow?.min ?? 3) &&
             inputTemperature <= (probes.cooling?.temp?.max ?? 30) &&
             outputTemperature <= (probes.cooling?.temp?.max ?? 35);
    },

    misc: (
      flameSensorStatus: FlameSensorStatus,
      uartStatus: UartStatus,
      connectionState: UartStatus
    ): boolean => {
      return flameSensorStatus === FlameSensorStatus.OK &&
             uartStatus === UartStatus.Connected &&
             connectionState === UartStatus.Connected;
    }
  };

  const getStatusProps = (isOk: boolean) => ({
    text: isOk ? "OK" : "Anomaly Detected",
    variant: isOk ? "success" : "danger"
  } as const);

  const getProgressBarRange = (min: number | undefined, max: number | undefined, defaultMin: number, defaultMax: number) => {
    const actualMin = min ?? defaultMin;
    const actualMax = max ?? defaultMax;
    const range = actualMax - actualMin;
    return {
      min: actualMin - (range * 0.25),
      max: actualMax + (range * 0.25)
    };
  };

  const isWithinBounds = (value: number, min: number | undefined, max: number | undefined) => {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  };

  const flowRange = getProgressBarRange(
    settingsStore.probes.cooling?.flow?.min,
    settingsStore.probes.cooling?.flow?.max,
    0,
    20
  );

  const tempRange = getProgressBarRange(
    settingsStore.probes.cooling?.temp?.min,
    settingsStore.probes.cooling?.temp?.max,
    0,
    100
  );

  return (
    <div className="flex-grow-1 grid m-4 mt-0" style={gridStyle}>
      <Card className="border-primary g-col-6">
        <CardHeader
          icon="bi-bullseye"
          title="FluidNC"
          status={getStatusProps(isPanelOk.fluidnc(laserStore.currentState, laserStore.alarmState))}
        />
        <Card.Body>
          <p>
            <strong>Current State:</strong>{' '}
            <Badge bg={getLaserStateBadge(laserStore.currentState)}>{laserStore.currentState}</Badge>
          </p>
          <p>
            <strong>Alarm State:</strong>{' '}
            <Badge bg={getAlarmStateBadge(laserStore.alarmState)}>{laserStore.alarmState}</Badge>
          </p>
        </Card.Body>
      </Card>
      <Card className="border-primary g-col-6">
        <CardHeader
          icon="bi-door-open"
          title="Lids"
          status={getStatusProps(isPanelOk.lids(lidsStore.frontLidState, lidsStore.backLidState))}
        />
        <Card.Body>
          <p>
            <strong>Front Lid:</strong>{' '}
            <Badge bg={getLidStateBadge(lidsStore.frontLidState)}>{lidsStore.frontLidState}</Badge>
          </p>
          <p>
            <strong>Back Lid:</strong>{' '}
            <Badge bg={getLidStateBadge(lidsStore.backLidState)}>{lidsStore.backLidState}</Badge>
          </p>
        </Card.Body>
      </Card>
      <Card className="border-primary g-col-6">
        <CardHeader
          icon="bi-thermometer-half"
          title="Cooling"
          status={getStatusProps(isPanelOk.cooling(coolingStore.inputFlow, coolingStore.outputFlow, coolingStore.inputTemperature, coolingStore.outputTemperature))}
        />
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col xs={4} style={labelStyle}><strong>Input Flow:</strong></Col>
            <Col xs={8}>
              <div style={progressBarContainerStyle}>
                <div style={progressLabelStyle}>{coolingStore.inputFlow} L/min</div>
                <ProgressBar
                  style={progressBarStyle}
                  min={flowRange.min}
                  max={flowRange.max}
                  now={coolingStore.inputFlow}
                  variant={isWithinBounds(
                    coolingStore.inputFlow,
                    settingsStore.probes.cooling?.flow?.min,
                    settingsStore.probes.cooling?.flow?.max
                  ) ? 'primary' : 'danger'}
                />
              </div>
            </Col>
          </Row>
          <Row className="mb-3 align-items-center">
            <Col xs={4} style={labelStyle}><strong>Input Temp.:</strong></Col>
            <Col xs={8}>
              <div style={progressBarContainerStyle}>
                <div style={progressLabelStyle}>{coolingStore.inputTemperature}°C</div>
                <ProgressBar
                  style={progressBarStyle}
                  min={tempRange.min}
                  max={tempRange.max}
                  now={coolingStore.inputTemperature}
                  variant={isWithinBounds(
                    coolingStore.inputTemperature,
                    settingsStore.probes.cooling?.temp?.min,
                    settingsStore.probes.cooling?.temp?.max
                  ) ? 'primary' : 'danger'}
                />
              </div>
            </Col>
          </Row>
          <Row className="mb-3 align-items-center">
            <Col xs={4} style={labelStyle}><strong>Output Flow:</strong></Col>
            <Col xs={8}>
              <div style={progressBarContainerStyle}>
                <div style={progressLabelStyle}>{coolingStore.outputFlow} L/min</div>
                <ProgressBar
                  style={progressBarStyle}
                  min={flowRange.min}
                  max={flowRange.max}
                  now={coolingStore.outputFlow}
                  variant={isWithinBounds(
                    coolingStore.outputFlow,
                    settingsStore.probes.cooling?.flow?.min,
                    settingsStore.probes.cooling?.flow?.max
                  ) ? 'primary' : 'danger'}
                />
              </div>
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col xs={4} style={labelStyle}><strong>Output Temp.:</strong></Col>
            <Col xs={8}>
              <div style={progressBarContainerStyle}>
                <div style={progressLabelStyle}>{coolingStore.outputTemperature}°C</div>
                <ProgressBar
                  style={progressBarStyle}
                  min={tempRange.min}
                  max={tempRange.max}
                  now={coolingStore.outputTemperature}
                  variant={isWithinBounds(
                    coolingStore.outputTemperature,
                    settingsStore.probes.cooling?.temp?.min,
                    settingsStore.probes.cooling?.temp?.max
                  ) ? 'primary' : 'danger'}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card className="border-primary g-col-6">
        <CardHeader
          icon="bi-gear"
          title="Misc."
          status={getStatusProps(isPanelOk.misc(systemStore.flameSensorStatus, systemStore.uartStatus, serialStore.connectionState))}
        />
        <Card.Body>
          <p>
            <strong>Flame Sensor Status:</strong>{' '}
            <Badge bg={getFlameSensorBadge(systemStore.flameSensorStatus)}>{systemStore.flameSensorStatus}</Badge>
          </p>
          <p>
            <strong>UART#1 Status:</strong>{' '}
            <Badge bg={getUartStatusBadge(systemStore.uartStatus)}>{systemStore.uartStatus}</Badge>
          </p>
          <p>
            <strong>UART#2 Status:</strong>{' '}
            <Badge bg={getSerialConnectionBadge(serialStore.connectionState)}>{serialStore.connectionState}</Badge>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
});

export default Status;
