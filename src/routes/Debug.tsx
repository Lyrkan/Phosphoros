import { Button, Card, Form, InputGroup, Dropdown } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { FormEvent, useState, useEffect, useRef } from "react";
import { useStore } from "../stores/RootStore";
import { UartStatus } from "../types/Stores";
import CardHeader from "../components/CardHeader";
import { useSerialService } from '../contexts/SerialServiceContext';
import { IncomingMessageType, OutgoingMessageType } from "../types/Messages";
import { MESSAGE_RX_PREFIX, MESSAGE_TX_PREFIX, MESSAGE_ERROR_PREFIX } from "../services/SerialService";

interface MessageFilter {
  id: string;
  label: string;
  isEnabled: boolean;
  predicate: (text: string) => boolean;
}

export default observer(function Debug() {
  const { serialStore } = useStore();
  const serialService = useSerialService();
  const [message, setMessage] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [messageFilters, setMessageFilters] = useState<MessageFilter[]>([
    {
      id: 'rx-status',
      label: 'Status Reports',
      isEnabled: true,
      predicate: (text: string) => isMessageOfType(text, IncomingMessageType.StatusReport),
    },
    {
      id: 'rx-grbl-report',
      label: 'GRBL Reports',
      isEnabled: true,
      predicate: (text: string) => isMessageOfType(text, IncomingMessageType.GrblReport),
    },
    {
      id: 'rx-grbl-message',
      label: 'GRBL Messages',
      isEnabled: true,
      predicate: (text: string) => isMessageOfType(text, IncomingMessageType.GrblMessage),
    },
    {
      id: 'rx-grbl-ack',
      label: 'GRBL Acks',
      isEnabled: true,
      predicate: (text: string) => isMessageOfType(text, IncomingMessageType.GrblAck),
    },
    {
      id: 'rx-settings',
      label: 'Settings Updates',
      isEnabled: true,
      predicate: (text: string) => isMessageOfType(text, IncomingMessageType.ControllerSettings),
    },
    {
      id: 'tx',
      label: 'Outgoing Messages',
      isEnabled: true,
      predicate: (text: string) => text.startsWith(MESSAGE_TX_PREFIX),
    },
    {
      id: 'error',
      label: 'Errors',
      isEnabled: true,
      predicate: (text: string) => text.startsWith(MESSAGE_ERROR_PREFIX),
    },
  ]);
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

  const isMessageOfType = (text: string, type: IncomingMessageType): boolean => {
    if (!text.startsWith(MESSAGE_RX_PREFIX)) return false;
    try {
      const jsonStr = text.substring(3).trim();
      const parsed = JSON.parse(jsonStr);
      return typeof parsed === 'object' && parsed.t === type;
    } catch {
      return false;
    }
  };

  const handleFilterChange = (filterId: string, checked: boolean) => {
    setMessageFilters(filters =>
      filters.map(filter =>
        filter.id === filterId ? { ...filter, isEnabled: checked } : filter
      )
    );
  };

  const filteredMessages = serialStore.messages.filter(msg =>
    messageFilters.some(filter => filter.isEnabled && filter.predicate(msg.text))
  );

  const getActiveFiltersLabel = () => {
    const activeCount = messageFilters.filter(f => f.isEnabled).length;
    const totalCount = messageFilters.length;
    return activeCount === totalCount ? 'All' : `${activeCount}/${totalCount}`;
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
        extra={
          <div className="text-white small fw-normal ms-4">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-light"
                size="sm"
                id="message-filters-dropdown"
                className="d-flex align-items-center gap-2"
                style={{ width: '135px' }}
              >
                <i className="bi bi-funnel"></i>
                Filters ({getActiveFiltersLabel()})
              </Dropdown.Toggle>
              <Dropdown.Menu className="p-2" style={{ minWidth: '200px' }}>
                {messageFilters.map(filter => (
                  <Form.Check
                    key={filter.id}
                    type="checkbox"
                    id={`filter-${filter.id}`}
                    label={filter.label}
                    checked={filter.isEnabled}
                    onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                    className="mb-2"
                  />
                ))}
                <Dropdown.Divider />
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="w-50"
                    onClick={() => setMessageFilters(filters =>
                      filters.map(filter => ({ ...filter, isEnabled: true }))
                    )}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="w-50"
                    onClick={() => setMessageFilters(filters =>
                      filters.map(filter => ({ ...filter, isEnabled: false }))
                    )}
                  >
                    Clear All
                  </Button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
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
