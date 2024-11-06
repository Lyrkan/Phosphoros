import { Card, Form } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import CardHeader from "../../components/CardHeader";
import { useSettings } from "../../hooks/useSettings";

export default observer(function GrblSettings() {
  const settings = useSettings();

  return (
    <Card className="border-primary">
      <CardHeader icon="bi-cpu" title="Grbl options" />
      <Card.Body>
        <Card.Text as="div">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Jog Speed (mm/min)</Form.Label>
              <Form.Control
                type="number"
                value={settings.grbl.jog_speed ?? ''}
                onChange={e => settings.updateSettings({ grbl: { jog_speed: Number(e.target.value) } })}
              />
              <Form.Text className="text-muted">Speed used for manual movements</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Default Timeout (ms)</Form.Label>
              <Form.Control
                type="number"
                value={settings.grbl.default_timeout_ms ?? ''}
                onChange={e => settings.updateSettings({ grbl: { default_timeout_ms: Number(e.target.value) } })}
              />
              <Form.Text className="text-muted">Default timeout for Grbl commands</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Homing Timeout (ms)</Form.Label>
              <Form.Control
                type="number"
                value={settings.grbl.homing_timeout_ms ?? ''}
                onChange={e => settings.updateSettings({ grbl: { homing_timeout_ms: Number(e.target.value) } })}
              />
              <Form.Text className="text-muted">Timeout for homing operations</Form.Text>
            </Form.Group>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  );
});
