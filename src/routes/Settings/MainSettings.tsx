import { Card, Form } from "react-bootstrap";
import CardHeader from "../../components/CardHeader";

export default function MainSettings() {
  return (
    <Card className="border-primary">
      <CardHeader icon="bi-sliders" title="Main options" />
      <Card.Body>
        <Card.Text as="div">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Field 1</Form.Label>
              <Form.Control type="text" placeholder="Placeholder"/>
              <Form.Text className="text-muted">Comment</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Field 2</Form.Label>
              <Form.Control type="text" placeholder="Placeholder"/>
              <Form.Text className="text-muted">Comment</Form.Text>
            </Form.Group>
          </Form>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
