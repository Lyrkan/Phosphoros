import { Container, Nav, Navbar as BootstrapNavbar, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import logo from '../../assets/logo-mini.svg';
import { observer } from 'mobx-react-lite';
import { useSerialService } from '../contexts/SerialServiceContext';

const Navbar = observer(() => {
  const serialService = useSerialService();

  const handleReconnect = async () => {
    try {
      await serialService.connect();
    } catch (error) {
      // Error handling is already done in SerialService
    }
  };

  return (
    <BootstrapNavbar expand="lg" fixed='top' className="bg-primary">
      <Container className="d-flex align-items-center gap-2">
        <BootstrapNavbar.Brand className="d-flex align-items-center gap-2">
          <img src={logo} alt="Phosphoros" width="48" height="48" />
          <span className="fw-bold">Phosphoros</span>
        </BootstrapNavbar.Brand>
        <Nav className="me-auto gap-3">
          <LinkContainer to="/"><Nav.Link><i className="bi bi-display"></i> Status</Nav.Link></LinkContainer>
          <LinkContainer to="/controls"><Nav.Link><i className="bi bi-dpad"></i> Controls</Nav.Link></LinkContainer>
          <LinkContainer to="/settings/grbl"><Nav.Link><i className="bi bi-gear"/> Settings</Nav.Link></LinkContainer>
          <LinkContainer to="/debug"><Nav.Link><i className="bi bi-chevron-right"/> Debug</Nav.Link></LinkContainer>
        </Nav>
        <Button
          variant="outline-warning"
          size="sm"
          onClick={handleReconnect}
        >
          Reconnect
        </Button>
      </Container>
    </BootstrapNavbar>
  )
});

export default Navbar;
