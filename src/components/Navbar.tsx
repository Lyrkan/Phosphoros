import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default function Navbar() {
  return (
    <BootstrapNavbar expand="lg" fixed='top' className="bg-primary">
      <Container>
        <BootstrapNavbar.Brand className="text-white">
          <i className="bi bi-layers-half me-2"></i>
          Laser Cutter Panel
        </BootstrapNavbar.Brand>
        <Nav className="me-auto gap-3">
          <LinkContainer to="/"><Nav.Link><i className="bi bi-display"></i> Status</Nav.Link></LinkContainer>
          <LinkContainer to="/controls"><Nav.Link><i className="bi bi-dpad"></i> Controls</Nav.Link></LinkContainer>
          <LinkContainer to="/settings/grbl"><Nav.Link><i className="bi bi-gear"/> Settings</Nav.Link></LinkContainer>
          <LinkContainer to="/debug"><Nav.Link><i className="bi bi-chevron-right"/> Debug</Nav.Link></LinkContainer>
        </Nav>
      </Container>
    </BootstrapNavbar>
  )
}
