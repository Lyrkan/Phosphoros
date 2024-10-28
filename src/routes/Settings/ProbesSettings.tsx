import { Card, Form, Row, Col } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import CardHeader from "../../components/CardHeader";
import { useSettings } from "../../hooks/useSettings";

export default observer(function ProbesSettings() {
  const settings = useSettings();

  return (
    <Card className="border-primary">
      <CardHeader icon="bi-thermometer-half" title="Probes options" />
      <Card.Body>
        <Card.Text as="div">
          <Form>
            <h6 className="mb-3">Cooling Flow (L/s)</h6>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Minimum</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={settings.probes.cooling?.flow?.min ?? ''}
                    onChange={e => settings.updateSettings({
                      probes: {
                        cooling: {
                          flow: {
                            ...settings.probes.cooling?.flow,
                            min: Number(e.target.value)
                          }
                        }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Maximum</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={settings.probes.cooling?.flow?.max ?? ''}
                    onChange={e => settings.updateSettings({
                      probes: {
                        cooling: {
                          flow: {
                            ...settings.probes.cooling?.flow,
                            max: Number(e.target.value)
                          }
                        }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3">Cooling Temperature (°C)</h6>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Minimum</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={settings.probes.cooling?.temp?.min ?? ''}
                    onChange={e => settings.updateSettings({
                      probes: {
                        cooling: {
                          temp: {
                            ...settings.probes.cooling?.temp,
                            min: Number(e.target.value)
                          }
                        }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Maximum</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={settings.probes.cooling?.temp?.max ?? ''}
                    onChange={e => settings.updateSettings({
                      probes: {
                        cooling: {
                          temp: {
                            ...settings.probes.cooling?.temp,
                            max: Number(e.target.value)
                          }
                        }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  );
});
