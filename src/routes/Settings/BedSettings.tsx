import { Card, Form } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import CardHeader from "../../components/CardHeader";
import { useSettings } from "../../hooks/useSettings";
import { BedControlMode } from "../../types/Settings";

export default observer(function BedSettings() {
  const settings = useSettings();

  return (
    <Card className="border-primary">
      <CardHeader icon="bi-arrows-expand" title="Bed options" />
      <Card.Body>
        <Card.Text as="div">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Control Mode</Form.Label>
              <Form.Select
                value={settings.bed.control_mode ?? ''}
                onChange={e => settings.updateSettings({
                  bed: { control_mode: Number(e.target.value) as BedControlMode }
                })}
              >
                <option value="">Select mode...</option>
                <option value={BedControlMode.Grbl}>GRBL</option>
                <option value={BedControlMode.Stepper}>Control Board (stepper)</option>
              </Form.Select>
              <Form.Text className="text-muted">How the bed movement is controlled</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Screw Lead (µm)</Form.Label>
              <Form.Control
                type="number"
                value={settings.bed.screw_lead_um ?? ''}
                onChange={e => settings.updateSettings({ bed: { screw_lead_um: Number(e.target.value) } })}
              />
              <Form.Text className="text-muted">Lead of the bed screw in micrometers</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Microstep Multiplier</Form.Label>
              <Form.Control
                type="number"
                value={settings.bed.microstep_multiplier ?? ''}
                onChange={e => settings.updateSettings({ bed: { microstep_multiplier: Number(e.target.value) } })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Steps per Revolution</Form.Label>
              <Form.Control
                type="number"
                value={settings.bed.steps_per_revolution ?? ''}
                onChange={e => settings.updateSettings({ bed: { steps_per_revolution: Number(e.target.value) } })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Moving Speed</Form.Label>
              <Form.Control
                type="number"
                value={settings.bed.moving_speed ?? ''}
                onChange={e => settings.updateSettings({ bed: { moving_speed: Number(e.target.value) } })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Homing Speed</Form.Label>
              <Form.Control
                type="number"
                value={settings.bed.homing_speed ?? ''}
                onChange={e => settings.updateSettings({ bed: { homing_speed: Number(e.target.value) } })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Backoff Distance (µm)</Form.Label>
              <Form.Control
                type="number"
                value={settings.bed.backoff_distance_um ?? ''}
                onChange={e => settings.updateSettings({ bed: { backoff_distance_um: Number(e.target.value) } })}
              />
              <Form.Text className="text-muted">Distance to move back when a limit switch is triggered</Form.Text>
            </Form.Group>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  );
});
