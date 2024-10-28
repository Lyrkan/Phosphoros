import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import CardHeader from "../components/CardHeader";
import AxisControl from "../components/AxisControl";
import { useStore } from "../stores/RootStore";

const Controls = observer(() => {
  const { laserStore } = useStore();
  const [showMachinePosition, setShowMachinePosition] = useState(false);

  const gridStyle = {
    gridAutoRows: '1fr'
  };

  const currentPosition = showMachinePosition ? laserStore.machinePosition : laserStore.workPosition;

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
              <Button variant="primary" className="me-2">
                <i className="bi bi-house-door"></i> Home X/Y
              </Button>
              <Button variant="primary" className="me-4">
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
            onMove={(increment) => console.log(`X-axis: Moving ${increment}mm`)}
            onHome={() => console.log('X-axis: Homing')}
          />
          <AxisControl
            axis="Y"
            position={currentPosition.y}
            onMove={(increment) => console.log(`Y-axis: Moving ${increment}mm`)}
            onHome={() => console.log('Y-axis: Homing')}
          />
          <AxisControl
            axis="Z"
            position={currentPosition.z}
            onMove={(increment) => console.log(`Z-axis: Moving ${increment}mm`)}
            onHome={() => console.log('Z-axis: Homing')}
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
