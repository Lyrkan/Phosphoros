import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import CardHeader from "../components/CardHeader";
import AxisControl from "../components/AxisControl";
import ToggleControl from "../components/ToggleControl";
import { useStore } from "../stores/RootStore";
import { useCommandTracking } from '../contexts/CommandTrackingContext';
import { useSerialService } from '../contexts/SerialServiceContext';
import { OutgoingMessageType, RelaysSetPayload } from '../types/Messages';
import { LaserState } from "../types/Stores";

const Controls = observer(() => {
  const { laserStore, settingsStore, toastStore } = useStore();
  const serialService = useSerialService();
  const { sendCommand, hasPendingCommands } = useCommandTracking();
  const [showMachinePosition, setShowMachinePosition] = useState(true);

  const gridStyle = {
    gridAutoRows: '1fr'
  };

  const currentPosition = showMachinePosition ? laserStore.machinePosition : laserStore.workPosition;

  const isControlDisabled = () => {
    return hasPendingCommands || laserStore.currentState !== LaserState.Idle;
  };

  const handleAxisMove = async (axis: 'X' | 'Y' | 'Z', increment: number) => {
    const jogSpeed = (settingsStore.grbl.jog_speed ?? 100) * 60; // Default to 100mm/s if not set
    const command = `$J=G21 G91 F${jogSpeed} ${axis}${increment}`;
    await sendCommand(command);
  };

  const handleAxisHome = async (axis: 'X' | 'Y' | 'Z' | 'XY') => {
    await sendCommand(`$H=${axis}`, true);
  };

  const handleDisableSteppers = async () => {
    await sendCommand('$MD');
  };

  const handleRelayToggle = async (relay: keyof RelaysSetPayload, newValue: boolean) => {
    try {
      await serialService.sendCommand(OutgoingMessageType.RelaysSet, {
        [relay]: newValue
      });
    } catch (error) {
      toastStore.show(
        'Action Failed',
        `Failed to toggle ${relay}: ${error.message}`,
        'danger'
      );
    }
  };

  return (
    <div className="flex-grow-1 grid m-4 mt-0" style={gridStyle}>
      <Card className="border-primary g-col-12">
        <CardHeader
          icon="bi-dpad"
          title="Toolhead"
          note={isControlDisabled() ? (
            hasPendingCommands ? "Commands are pending..." : "Machine is busy..."
          ) : undefined}
        />
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col xs={3}>
              <strong>Speed:</strong>{' '}
              <span className="font-monospace" style={{ display: 'inline-block', width: '7ch', textAlign: 'right' }}>
                {(laserStore.speed / 60).toFixed(1)}
              </span>
              {' '}mm/s
            </Col>
            <Col>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => handleAxisHome('XY')}
                disabled={isControlDisabled()}
              >
                <i className="bi bi-house-door"></i> Home X/Y
              </Button>
              <Button
                variant="primary"
                className="me-4"
                onClick={handleDisableSteppers}
                disabled={isControlDisabled()}
              >
                <i className="bi bi-lock"></i> Disable Steppers
              </Button>
              <Form.Check
                type="switch"
                id="position-toggle"
                label={showMachinePosition ? "Machine Position" : "Work Position"}
                checked={showMachinePosition}
                onChange={(e) => setShowMachinePosition(e.target.checked)}
                className="d-inline-block"
              />
            </Col>
          </Row>
          <AxisControl
            className="mb-3"
            axis="X"
            position={currentPosition.x}
            onMove={(increment) => handleAxisMove('X', increment)}
            onHome={() => handleAxisHome('X')}
            disabled={isControlDisabled()}
          />
          <AxisControl
            className="mb-3"
            axis="Y"
            position={currentPosition.y}
            onMove={(increment) => handleAxisMove('Y', increment)}
            onHome={() => handleAxisHome('Y')}
            disabled={isControlDisabled()}
          />
          <AxisControl
            className="mb-0"
            axis="Z"
            position={currentPosition.z}
            onMove={(increment) => handleAxisMove('Z', increment)}
            onHome={() => handleAxisHome('Z')}
            increments={[0.05, 0.1, 1, 10]}
            disabled={isControlDisabled()}
          />
        </Card.Body>
      </Card>
      <Card className="border-primary g-col-12">
        <CardHeader icon="bi-toggles" title="Toggles" />
        <Card.Body>
          <Row>
            <Col xs={6} className="mb-3">
              <ToggleControl
                icon="bi-shield-lock"
                activeIcon="bi-shield-lock-fill"
                label="Interlock"
                isActive={laserStore.interlock === true}
                onChange={(newValue) => handleRelayToggle('interlock', newValue)}
              />
            </Col>
            <Col xs={6} className="mb-3">
              <ToggleControl
                icon="bi-lightbulb"
                activeIcon="bi-lightbulb-fill"
                label="Lights"
                isActive={laserStore.lights === true}
                onChange={(newValue) => handleRelayToggle('lights', newValue)}
              />
            </Col>
            <Col xs={6}>
              <ToggleControl
                icon="bi-wind"
                label="Air Assist"
                isActive={laserStore.airAssist === true}
                onChange={(newValue) => handleRelayToggle('air_assist', newValue)}
              />
            </Col>
            <Col xs={6}>
              <ToggleControl
                icon="bi-plug"
                activeIcon="bi-plug-fill"
                label="Accessory"
                isActive={laserStore.accessory === true}
                onChange={(newValue) => handleRelayToggle('accessory', newValue)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
});

export default Controls;
