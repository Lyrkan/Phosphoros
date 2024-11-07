import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo-mini.svg';

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <BootstrapNavbar expand="lg" fixed='top' className="bg-primary">
      <Container className="d-flex align-items-center gap-2">
        <BootstrapNavbar.Brand className="d-flex align-items-center gap-2">
          <img src={logo} alt="Laser Cutter Panel" width="48" height="48" />
          <span className="fw-bold">Laser Cutter Panel</span>
        </BootstrapNavbar.Brand>
        <Nav className="me-auto gap-3">
          <LinkContainer to="/"><Nav.Link><i className="bi bi-display"></i> Status</Nav.Link></LinkContainer>
          <LinkContainer to="/controls"><Nav.Link><i className="bi bi-dpad"></i> Controls</Nav.Link></LinkContainer>
          <LinkContainer to="/settings/grbl"><Nav.Link><i className="bi bi-gear"/> Settings</Nav.Link></LinkContainer>
          <LinkContainer to="/debug"><Nav.Link><i className="bi bi-chevron-right"/> Debug</Nav.Link></LinkContainer>
        </Nav>
        <span className="text-light small">{currentTime}</span>
      </Container>
    </BootstrapNavbar>
  )
}
