import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import CardHeader from "../components/CardHeader";
import AxisControl from "../components/AxisControl";
import { useStore } from "../stores/RootStore";
import { useSerialService } from '../contexts/SerialServiceContext';
import { OutgoingMessageType } from "../types/Messages";

const Controls = observer(() => {
  const { laserStore, settingsStore, toastStore } = useStore();
  const serialService = useSerialService();
  const [showMachinePosition, setShowMachinePosition] = useState(false);

  const gridStyle = {
    gridAutoRows: '1fr'
  };

  const currentPosition = showMachinePosition ? laserStore.machinePosition : laserStore.workPosition;

  const handleAxisMove = async (axis: 'X' | 'Y' | 'Z', increment: number) => {
    const jogSpeed = (settingsStore.grbl.jog_speed ?? 100) * 60; // Default to 100mm/s if not set
    const command = `$J=G21 G91 F${jogSpeed} ${axis}${increment}`;

    try {
      await serialService.sendCommand(OutgoingMessageType.GrblAction, {
        message: command
      });
    } catch (error) {
      toastStore.show(
        'Jog command failed',
        `Failed to send the jog command to the controller: ${error.message}`,
        'danger'
      );
    }
  };

  const handleAxisHome = async (axis: 'X' | 'Y' | 'Z' | 'XY') => {
    try {
      await serialService.sendCommand(OutgoingMessageType.GrblAction, {
        message: `$H${axis}`
      });
    } catch (error) {
      toastStore.show(
        'Homing failed',
        `Failed to home ${axis}: ${error.message}`,
        'danger'
      );
    }
  };

  const handleDisableSteppers = async () => {
    try {
      await serialService.sendCommand(OutgoingMessageType.GrblAction, {
        message: '$MD'
      });
    } catch (error) {
      toastStore.show(
        'Disable steppers failed',
        `Failed to disable steppers: ${error.message}`,
        'danger'
      );
    }
  };

  return (
    <div className="flex-grow-1 grid m-4 mt-0" style={gridStyle}>
      <Card className="border-primary g-col-12">
        <CardHeader icon="bi-dpad" title="Axis controls" />
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col xs={3}>
              <strong>Speed:</strong>{' '}
              <span className="font-monospace" style={{ display: 'inline-block', width: '7ch', textAlign: 'right' }}>
                {laserStore.speed.toFixed(1)}
              </span>
              {' '}mm/s
            </Col>
            <Col>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => handleAxisHome('XY')}
              >
                <i className="bi bi-house-door"></i> Home X/Y
              </Button>
              <Button
                variant="primary"
                className="me-4"
                onClick={handleDisableSteppers}
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
            axis="X"
            position={currentPosition.x}
            onMove={(increment) => handleAxisMove('X', increment)}
            onHome={() => handleAxisHome('X')}
          />
          <AxisControl
            axis="Y"
            position={currentPosition.y}
            onMove={(increment) => handleAxisMove('Y', increment)}
            onHome={() => handleAxisHome('Y')}
          />
          <AxisControl
            axis="Z"
            position={currentPosition.z}
            onMove={(increment) => handleAxisMove('Z', increment)}
            onHome={() => handleAxisHome('Z')}
            increments={[0.05, 0.1, 1, 10]}
          />
        </Card.Body>
      </Card>
      <Card className="border-primary g-col-12">
        <CardHeader icon="bi-toggles" title="Toggles" />
        <Card.Body className="d-flex flex-column justify-content-between">
          <Row className="flex-grow-1">
            <Col xs={6} className="d-flex justify-content-center mb-2">
              <Button
                variant="primary"
                onClick={() => console.log(`Interlock toggled`)}
                className="w-100 h-100"
                active={laserStore.interlock}
              >
                <i className="bi bi-shield-lock"></i> Interlock
              </Button>
            </Col>
            <Col xs={6} className="d-flex justify-content-center mb-2">
              <Button
                variant="primary"
                onClick={() => console.log(`Lights toggled`)}
                className="w-100 h-100"
                active={laserStore.lights}
              >
                <i className="bi bi-lightbulb"></i> Lights
              </Button>
            </Col>
            <Col xs={6} className="d-flex justify-content-center mb-2">
              <Button
                variant="primary"
                onClick={() => console.log(`Air Assist toggled`)}
                className="w-100 h-100"
                active={laserStore.airAssist}
              >
                <i className="bi bi-wind"></i> Air Assist
              </Button>
            </Col>
            <Col xs={6} className="d-flex justify-content-center mb-2">
              <Button
                variant="primary"
                onClick={() => console.log(`Beam Preview toggled`)}
                className="w-100 h-100"
                active={laserStore.beamPreview}
              >
                <i className="bi bi-eye"></i> Beam Preview
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
});

export default Controls;
