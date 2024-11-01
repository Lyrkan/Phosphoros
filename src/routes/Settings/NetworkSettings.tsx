import { Alert, Card, Form } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import CardHeader from "../../components/CardHeader";
import { useSettings } from "../../hooks/useSettings";

export default observer(function NetworkSettings() {
  const settings = useSettings();

  return (
    <Card className="border-primary">
      <CardHeader icon="bi-wifi" title="Network options" />
      <Card.Body>
        <Card.Text as="div">
          <Alert variant="info" className="small">
            <i className="bi bi-info-circle me-2"></i>
            Please note that all of these settings apply to the K40 Control Panel board, not the panel itself.
          </Alert>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>OTA Login</Form.Label>
              <Form.Control
                type="text"
                value={settings.ota.login ?? ''}
                onChange={e => settings.updateSettings({ ota: { login: e.target.value } })}
              />
              <Form.Text className="text-muted">Login for OTA updates</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>OTA Password</Form.Label>
              <Form.Control
                type="password"
                value={settings.ota.password ?? ''}
                onChange={e => settings.updateSettings({ ota: { password: e.target.value } })}
              />
              <Form.Text className="text-muted">Password for OTA updates</Form.Text>
            </Form.Group>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  );
});
