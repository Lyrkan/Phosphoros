import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { FormEvent, useState, useEffect, useRef } from "react";
import { useStore } from "../stores/RootStore";
import { UartStatus } from "../types/Stores";
import CardHeader from "../components/CardHeader";
import { useSerialService } from '../contexts/SerialServiceContext';
import { IncomingMessageType, OutgoingMessageType } from "../types/Messages";
import { MESSAGE_RX_PREFIX, MESSAGE_TX_PREFIX, MESSAGE_ERROR_PREFIX } from "../services/SerialService";

export default observer(function Debug() {
  const { serialStore } = useStore();
  const serialService = useSerialService();
  const [message, setMessage] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [hideGrblMessages, setHideGrblMessages] = useState(false);
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
        await serialService.sendCommand(OutgoingMessageType.GrblAction, { message });
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

  const getMessageType = (text: string): string => {
    if (text.startsWith(MESSAGE_RX_PREFIX)) return 'rx';
    if (text.startsWith(MESSAGE_TX_PREFIX)) return 'tx';
    if (text.startsWith(MESSAGE_ERROR_PREFIX)) return 'error';
    return 'default';
  };

  const isGrblMessage = (text: string): boolean => {
    if (!text.startsWith(MESSAGE_RX_PREFIX)) return false;
    try {
      const jsonStr = text.substring(3).trim();
      const parsed = JSON.parse(jsonStr);
      return typeof parsed === 'object' && parsed.t === IncomingMessageType.GrblMessage;
    } catch {
      return false;
    }
  };

  const filteredMessages = hideGrblMessages
    ? serialStore.messages.filter(msg => !isGrblMessage(msg.text))
    : serialStore.messages;

  return (
    <Card className="border-primary flex-grow-1 m-4 mt-0">
      <CardHeader
        icon="bi-chevron-right"
        title="Serial"
        status={{
          text: serialStore.connectionState,
          variant: getStatusVariant()
        }}
        extra={
          <div className="text-white small fw-normal ms-4">
            <Form.Check
              type="checkbox"
              id="hide-grbl-messages"
              label="Hide GRBL messages"
              checked={hideGrblMessages}
              onChange={(e) => setHideGrblMessages(e.target.checked)}
              className="mb-0"
            />
          </div>
        }
      />
      <Card.Body
        as="pre"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="mb-0"
        style={{ maxHeight: '500px', overflow: 'auto' }}
      >
        {filteredMessages.map((msg, index) => (
          <div className={`message-${getMessageType(msg.text)}`} key={index}>
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
