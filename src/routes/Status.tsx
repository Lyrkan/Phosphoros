import { Card, ProgressBar, Row, Col, Badge } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/RootStore";
import CardHeader from "../components/CardHeader";
import { LaserState, AlarmState, LidState, FlameSensorStatus, UartStatus } from "../types/Stores";
import { ReactElement, useMemo, useState } from 'react';
import { CoolingMetric } from "../stores/CoolingHistoryStore";
import CoolingHistoryModal from "../components/CoolingHistoryModal";

enum PanelStatus {
  Ok = 'ok',
  Warning = 'warning',
  Error = 'error'
}

const Status = observer(() => {
  const { laserStore, lidsStore, coolingStore, systemStore, serialStore, settingsStore } = useStore();
  const [selectedMetric, setSelectedMetric] = useState<CoolingMetric | null>(null);

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
    fontSize: '.9em',
  };

  const searchIconStyle = {
    position: 'absolute' as const,
    right: '.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    color: 'var(--bs-body-color)',
    opacity: 0.5,
    fontSize: '1rem'
  };

  const marqueeContainerStyle = {
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    position: 'relative' as const,
    flex: '1',
  };

  const marqueeTextStyle = {
    display: 'inline-block',
    animation: 'marquee 15s linear infinite',
  };

  const getProgressBarStyle = (variant: string) => ({
    height: '100%',
    backgroundColor: (variant === 'danger' ? 'var(--bs-danger-bg-subtle)' : 'var(--bs-progress-bg)'),
  });

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    margin: 0,
  };

  const getStatusBadge = (state: string, warningStates: string[], okStates: string[]): ReactElement|null => {
    if (okStates.includes(state)) {
      return <Badge bg="success">OK</Badge>;
    }
    if (warningStates.includes(state)) {
      return <Badge bg="warning">Warning</Badge>;
    }
    return <Badge bg="danger">Problem</Badge>;
  };

  const getLaserStateBadge = (state: LaserState): ReactElement|null => {
    return getStatusBadge(
      state,
      [
        LaserState.Hold,
        LaserState.HoldComplete,
        LaserState.Door,
        LaserState.DoorHold,
        LaserState.DoorResume,
        LaserState.DoorRestart,
        LaserState.Check,
        LaserState.Run,
        LaserState.Home,
        LaserState.Unknown
      ],
      [LaserState.Idle, LaserState.Jog]
    );
  };

  const getAlarmStateBadge = (state: AlarmState): ReactElement|null => {
    return getStatusBadge(
      state,
      [AlarmState.Unknown],
      [AlarmState.NoAlarm]
    );
  };

  const getLidStateBadge = (state: LidState): ReactElement|null => {
    return getStatusBadge(
      state,
      [LidState.Unknown],
      [LidState.Closed]
    );
  };

  const getFlameSensorBadge = (state: FlameSensorStatus): ReactElement|null => {
    return getStatusBadge(
      state,
      [FlameSensorStatus.Unknown],
      [FlameSensorStatus.OK]
    );
  };

  const getInterlockBadge = (enabled: boolean | undefined): ReactElement|null => {
    if (!enabled) {
      return <Badge bg="warning">Warning</Badge>;
    }
    return  <Badge bg="success">Ok</Badge>;
  };

  const getUartStatusBadge = (state: UartStatus): ReactElement|null => {
    return getStatusBadge(
      state,
      [UartStatus.Unknown],
      [UartStatus.Connected]
    );
  };

  const getSerialConnectionBadge = (state: UartStatus): ReactElement|null => {
    return getStatusBadge(
      state,
      [UartStatus.Unknown],
      [UartStatus.Connected]
    );
  };

  const isWithinBounds = (value: number | undefined, min: number | undefined, max: number | undefined) => {
    if (value === undefined) return false;
    if (min === undefined || value < min) return false;
    if (max === undefined || value > max) return false;
    return true;
  };

  const getStatusProps = (state: PanelStatus) => {
    switch (state) {
      case PanelStatus.Ok:
        return { text: "OK", variant: "success" } as const;
      case PanelStatus.Warning:
        return { text: "Warning", variant: "warning" } as const;
      case PanelStatus.Error:
        return { text: "Issue detected", variant: "danger" } as const;
    }
  };

  const getPanelStatus = {
    fluidnc: (currentState: LaserState, currentAlarm: AlarmState): PanelStatus => {
      if (currentAlarm !== AlarmState.NoAlarm) return PanelStatus.Error;
      if (currentState === LaserState.Idle || currentState === LaserState.Jog) return PanelStatus.Ok;
      if ([
        LaserState.Hold,
        LaserState.HoldComplete,
        LaserState.Door,
        LaserState.DoorHold,
        LaserState.DoorResume,
        LaserState.DoorRestart,
        LaserState.Check,
        LaserState.Run,
        LaserState.Home,
        LaserState.Unknown
      ].includes(currentState)) return PanelStatus.Warning;
      return PanelStatus.Error;
    },

    lids: (frontLidState: LidState, backLidState: LidState): PanelStatus => {
      if (frontLidState === LidState.Unknown || backLidState === LidState.Unknown) return PanelStatus.Warning;
      if (frontLidState === LidState.Closed && backLidState === LidState.Closed) return PanelStatus.Ok;
      return PanelStatus.Error;
    },

    cooling: (
      inputFlow: number | undefined,
      outputFlow: number | undefined,
      inputTemperature: number | undefined,
      outputTemperature: number | undefined
    ): PanelStatus => {
      const { probes } = settingsStore;
      if (inputFlow === undefined || outputFlow === undefined ||
          inputTemperature === undefined || outputTemperature === undefined) return PanelStatus.Warning;
      if (isWithinBounds(inputFlow, probes.cooling?.flow?.min, probes.cooling?.flow?.max) &&
          isWithinBounds(outputFlow, probes.cooling?.flow?.min, probes.cooling?.flow?.max) &&
          isWithinBounds(inputTemperature, probes.cooling?.temp?.min, probes.cooling?.temp?.max) &&
          isWithinBounds(outputTemperature, probes.cooling?.temp?.min, probes.cooling?.temp?.max)) return PanelStatus.Ok;
      return PanelStatus.Error;
    },

    misc: (
      flameSensorStatus: FlameSensorStatus,
      uartStatus: UartStatus,
      connectionState: UartStatus
    ): PanelStatus => {
      if (flameSensorStatus === FlameSensorStatus.Unknown ||
          uartStatus === UartStatus.Unknown ||
          connectionState === UartStatus.Unknown) return PanelStatus.Warning;
      if (flameSensorStatus === FlameSensorStatus.OK &&
          uartStatus === UartStatus.Connected &&
          connectionState === UartStatus.Connected) return PanelStatus.Ok;
      return PanelStatus.Error;
    }
  };

  const getProgressBarRange = (min: number | undefined, max: number | undefined, defaultMin: number, defaultMax: number) => {
    const actualMin = min ?? defaultMin;
    const actualMax = max ?? defaultMax;
    const range = actualMax - actualMin;
    return {
      min: actualMin - (range * 0.25),
      max: actualMax + (range * 0.25)
    };
  };

  const progressBarVariants = useMemo(() => ({
    inputFlow: isWithinBounds(
      coolingStore.inputFlow,
      settingsStore.probes.cooling?.flow?.min,
      settingsStore.probes.cooling?.flow?.max
    ) ? 'primary' : 'danger',
    inputTemp: isWithinBounds(
      coolingStore.inputTemperature,
      settingsStore.probes.cooling?.temp?.min,
      settingsStore.probes.cooling?.temp?.max
    ) ? 'primary' : 'danger',
    outputFlow: isWithinBounds(
      coolingStore.outputFlow,
      settingsStore.probes.cooling?.flow?.min,
      settingsStore.probes.cooling?.flow?.max
    ) ? 'primary' : 'danger',
    outputTemp: isWithinBounds(
      coolingStore.outputTemperature,
      settingsStore.probes.cooling?.temp?.min,
      settingsStore.probes.cooling?.temp?.max
    ) ? 'primary' : 'danger',
  }), [
    coolingStore.inputFlow,
    coolingStore.inputTemperature,
    coolingStore.outputFlow,
    coolingStore.outputTemperature,
    settingsStore.probes.cooling?.flow?.min,
    settingsStore.probes.cooling?.flow?.max,
    settingsStore.probes.cooling?.temp?.min,
    settingsStore.probes.cooling?.temp?.max,
  ]);

  const flowRange = useMemo(() => getProgressBarRange(
    settingsStore.probes.cooling?.flow?.min,
    settingsStore.probes.cooling?.flow?.max,
    0,
    20
  ), [
    settingsStore.probes.cooling?.flow?.min,
    settingsStore.probes.cooling?.flow?.max
  ]);

  const tempRange = useMemo(() => getProgressBarRange(
    settingsStore.probes.cooling?.temp?.min,
    settingsStore.probes.cooling?.temp?.max,
    0,
    100
  ), [
    settingsStore.probes.cooling?.temp?.min,
    settingsStore.probes.cooling?.temp?.max
  ]);

  const handleProgressBarClick = (metric: CoolingMetric) => {
    setSelectedMetric(metric);
  };

  return (
      <div className="flex-grow-1 grid m-4 mt-0" style={gridStyle}>
        <Card className="border-primary g-col-6">
          <CardHeader
            icon="bi-cpu"
            title="FluidNC"
            status={getStatusProps(getPanelStatus.fluidnc(laserStore.currentState, laserStore.currentAlarm))}
          />
          <Card.Body>
            <div className="d-flex align-items-center gap-1 mb-3">
              <strong className="text-nowrap">Current State:</strong>
              <span className="flex-grow-1 fw-light">{laserStore.currentState}</span>
              {getLaserStateBadge(laserStore.currentState)}
            </div>
            <div className="d-flex align-items-center gap-1 mb-3">
              <strong className="text-nowrap">Alarm State:</strong>
              <span style={marqueeContainerStyle}>
                <span className="fw-light" style={laserStore.currentAlarm.length > 20 ? marqueeTextStyle : undefined}>
                  {laserStore.currentAlarm}
                </span>
              </span>
              {getAlarmStateBadge(laserStore.currentAlarm)}
            </div>
            <div className="d-flex align-items-center gap-2">
              <strong className="text-nowrap">Pins state:</strong>
              <span className="flex-grow-1 fw-light d-flex gap-1 flex-wrap">
                {Object.entries(laserStore.activePins).map(([key, value]) => (
                  <Badge key={key} bg={value ? 'warning' : 'dark'} className="text-uppercase">
                    {key}
                  </Badge>
                ))}
              </span>
            </div>
          </Card.Body>
        </Card>
        <Card className="border-primary g-col-6">
          <CardHeader
            icon="bi-door-open"
            title="Lids"
            status={getStatusProps(getPanelStatus.lids(lidsStore.frontLidState, lidsStore.backLidState))}
          />
          <Card.Body>
            <div className="d-flex align-items-center gap-1 mb-3">
              <strong className="text-nowrap">Front Lid:</strong>
              <span className="flex-grow-1 fw-light">{lidsStore.frontLidState}</span>
              {getLidStateBadge(lidsStore.frontLidState)}
            </div>
            <div className="d-flex align-items-center gap-1">
              <strong className="text-nowrap">Back Lid:</strong>
              <span className="flex-grow-1 fw-light">{lidsStore.backLidState}</span>
              {getLidStateBadge(lidsStore.backLidState)}
            </div>
          </Card.Body>
        </Card>
        <Card className="border-primary g-col-6">
          <CardHeader
            icon="bi-thermometer-half"
            title="Cooling"
            status={getStatusProps(getPanelStatus.cooling(coolingStore.inputFlow, coolingStore.outputFlow, coolingStore.inputTemperature, coolingStore.outputTemperature))}
          />
          <Card.Body>
            <Row className="mb-3 align-items-center">
              <Col xs={4} style={labelStyle}><strong>Input Flow:</strong></Col>
              <Col xs={8}>
                <div style={progressBarContainerStyle} onClick={() => handleProgressBarClick(CoolingMetric.InputFlow)} role="button">
                  <div style={progressLabelStyle}>
                    {coolingStore.inputFlow !== undefined ? `${coolingStore.inputFlow.toFixed(1)} L/min` : 'Unknown'}
                  </div>
                  <ProgressBar
                    style={getProgressBarStyle(progressBarVariants.inputFlow)}
                    min={flowRange.min}
                    max={flowRange.max}
                    now={coolingStore.inputFlow}
                    variant={progressBarVariants.inputFlow}
                  />
                  <i className="bi bi-search" style={searchIconStyle}></i>
                </div>
              </Col>
            </Row>
            <Row className="mb-3 align-items-center">
              <Col xs={4} style={labelStyle}><strong>Input Temp.:</strong></Col>
              <Col xs={8}>
                <div style={progressBarContainerStyle} onClick={() => handleProgressBarClick(CoolingMetric.InputTemperature)} role="button">
                  <div style={progressLabelStyle}>
                    {coolingStore.inputTemperature !== undefined ? `${coolingStore.inputTemperature.toFixed(1)}°C` : 'Unknown'}
                  </div>
                  <ProgressBar
                    style={getProgressBarStyle(progressBarVariants.inputTemp)}
                    min={tempRange.min}
                    max={tempRange.max}
                    now={coolingStore.inputTemperature}
                    variant={progressBarVariants.inputTemp}
                  />
                  <i className="bi bi-search" style={searchIconStyle}></i>
                </div>
              </Col>
            </Row>
            <Row className="mb-3 align-items-center">
              <Col xs={4} style={labelStyle}><strong>Output Flow:</strong></Col>
              <Col xs={8}>
                <div style={progressBarContainerStyle} onClick={() => handleProgressBarClick(CoolingMetric.OutputFlow)} role="button">
                  <div style={progressLabelStyle}>
                    {coolingStore.outputFlow !== undefined ? `${coolingStore.outputFlow.toFixed(1)} L/min` : 'Unknown'}
                  </div>
                  <ProgressBar
                    style={getProgressBarStyle(progressBarVariants.outputFlow)}
                    min={flowRange.min}
                    max={flowRange.max}
                    now={coolingStore.outputFlow}
                    variant={progressBarVariants.outputFlow}
                  />
                  <i className="bi bi-search" style={searchIconStyle}></i>
                </div>
              </Col>
            </Row>
            <Row className="align-items-center">
              <Col xs={4} style={labelStyle}><strong>Output Temp.:</strong></Col>
              <Col xs={8}>
                <div style={progressBarContainerStyle} onClick={() => handleProgressBarClick(CoolingMetric.OutputTemperature)} role="button">
                  <div style={progressLabelStyle}>
                    {coolingStore.outputTemperature !== undefined ? `${coolingStore.outputTemperature.toFixed(1)}°C` : 'Unknown'}
                  </div>
                  <ProgressBar
                    style={getProgressBarStyle(progressBarVariants.outputTemp)}
                    min={tempRange.min}
                    max={tempRange.max}
                    now={coolingStore.outputTemperature}
                    variant={progressBarVariants.outputTemp}
                  />
                  <i className="bi bi-search" style={searchIconStyle}></i>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Card className="border-primary g-col-6">
          <CardHeader
            icon="bi-gear"
            title="Misc."
            status={getStatusProps(getPanelStatus.misc(systemStore.flameSensorStatus, systemStore.uartStatus, serialStore.connectionState))}
          />
          <Card.Body>
            <div className="d-flex align-items-center gap-1 mb-3">
              <strong className="text-nowrap">Flame Sensor:</strong>
              <span className="flex-grow-1 fw-light">{systemStore.flameSensorStatus}</span>
              {getFlameSensorBadge(systemStore.flameSensorStatus)}
            </div>
            <div className="d-flex align-items-center gap-1 mb-3">
              <strong className="text-nowrap">Software interlock:</strong>
              <span className="flex-grow-1 fw-light">
                {laserStore.interlock === undefined ? 'Unknown' : (laserStore.interlock ? 'Enabled' : 'Disabled')}
              </span>
              {getInterlockBadge(laserStore.interlock)}
            </div>
            <div className="d-flex align-items-center gap-1 mb-3">
              <strong className="text-nowrap">UART#1 Status:</strong>
              <span className="flex-grow-1 fw-light">{systemStore.uartStatus}</span>
              {getUartStatusBadge(systemStore.uartStatus)}
            </div>
            <div className="d-flex align-items-center gap-1">
              <strong className="text-nowrap">UART#2 Status:</strong>
              <span className="flex-grow-1 fw-light">{(serialStore.connectionState === UartStatus.Error && serialStore.error) ? serialStore.error : serialStore.connectionState}</span>
              {getSerialConnectionBadge(serialStore.connectionState)}
            </div>
          </Card.Body>
        </Card>

        {selectedMetric && (
          <CoolingHistoryModal
            show={true}
            onHide={() => setSelectedMetric(null)}
            metric={selectedMetric}
          />
        )}
      </div>
  );
});

export default Status;
