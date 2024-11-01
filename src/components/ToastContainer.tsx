import { observer } from "mobx-react-lite";
import { Toast, ToastContainer as BootstrapToastContainer } from "react-bootstrap";
import { useStore } from "../stores/RootStore";

export default observer(function ToastContainer() {
  const { toastStore } = useStore();

  return (
    <BootstrapToastContainer className="p-3" position="bottom-end">
      {toastStore.toasts.map(toast => (
        <Toast
          key={toast.id}
          onClose={() => toastStore.remove(toast.id)}
          show={true}
          bg={toast.variant}
          autohide={toast.autohide}
          delay={toast.delay}
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto text-capitalize">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      ))}
    </BootstrapToastContainer>
  );
});
