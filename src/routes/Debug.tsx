import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { FormEvent, useState, useEffect, useRef } from "react";
import { UartStatus, useStore } from "../stores/RootStore";
import CardHeader from "../components/CardHeader";

export default observer(function Debug() {
  const { serialStore, serialService } = useStore();
  const [message, setMessage] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && autoScroll) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [serialStore.lastMessageTime, autoScroll]);

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const isScrolledToBottom =
        Math.abs(
          scrollContainer.scrollHeight -
          scrollContainer.clientHeight -
          scrollContainer.scrollTop
        ) < 1;
      setAutoScroll(isScrolledToBottom);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        await serialService.sendMessage({ command: message });
        setMessage("");
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const getStatusVariant = () => {
    switch (serialStore.connectionState) {
      case UartStatus.Connected:
        return "success";
      case UartStatus.Error:
        return "danger";
      default:
        return "warning";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card className="border-primary flex-grow-1 m-4 mt-0">
      <CardHeader
        icon="bi-chevron-right"
        title="Serial"
        status={{
          text: serialStore.connectionState,
          variant: getStatusVariant()
        }}
      />
      <Card.Body
        as="pre"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ maxHeight: '500px', overflow: 'auto' }}
      >
        {serialStore.messages.map((msg, index) => (
          <div key={index}>
            <span className="text-muted">[{formatTimestamp(msg.timestamp)}]</span> {msg.text}
          </div>
        ))}
      </Card.Body>
      <Card.Footer>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter command..."
              disabled={serialStore.connectionState !== UartStatus.Connected}
            />
            <Button
              variant="outline-secondary"
              type="submit"
              disabled={serialStore.connectionState !== UartStatus.Connected}
            >
              Send
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  );
});
