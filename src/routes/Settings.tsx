import { Col, Container, Nav, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Outlet } from "react-router-dom";

export default function Settings() {
  return (
    <Container fluid className="m-4 mt-0 p-0">
      <Row>
        <Col sm={3}>
          <Nav variant="pills d-flex" className="sticky-top">
            <LinkContainer to="/settings/grbl"><Nav.Link className="flex-grow-1"><i className="bi bi-cpu"/> GRBL</Nav.Link></LinkContainer>
            <LinkContainer to="/settings/network"><Nav.Link className="flex-grow-1"><i className="bi bi-wifi"/> Network</Nav.Link></LinkContainer>
            <LinkContainer to="/settings/bed"><Nav.Link className="flex-grow-1"><i className="bi bi-arrows-expand"/> Bed</Nav.Link></LinkContainer>
            <LinkContainer to="/settings/probes"><Nav.Link className="flex-grow-1"><i className="bi bi-thermometer"/> Probes</Nav.Link></LinkContainer>
            <LinkContainer to="/settings/relays"><Nav.Link className="flex-grow-1"><i className="bi bi-toggles"/> Relays</Nav.Link></LinkContainer>
          </Nav>
        </Col>
        <Col sm className="d-flex flex-column gap-2 mb-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
