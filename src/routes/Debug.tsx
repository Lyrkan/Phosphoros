import { Button, Card, Form, InputGroup, Dropdown } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { FormEvent, useState, useEffect, useRef } from "react";
import { useStore } from "../stores/RootStore";
import { UartStatus } from "../types/Stores";
import CardHeader from "../components/CardHeader";
import { useSerialService } from '../contexts/SerialServiceContext';
import { OutgoingMessageType } from "../types/Messages";
import { MESSAGE_RX_PREFIX, MESSAGE_TX_PREFIX, MESSAGE_ERROR_PREFIX } from "../services/SerialService";
import { MessageFilterId } from "../stores/DebugStore";

const MAX_DISPLAYED_MESSAGES = 50;

export default observer(function Debug() {
  const { serialStore, debugStore } = useStore();
  const serialService = useSerialService();
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

  const handleFilterChange = (filterId: MessageFilterId, checked: boolean) => {
    debugStore.setMessageFilterEnabled(filterId, checked);
  };

  const filteredMessages = serialStore.messages.filter(msg =>
    debugStore.messageFilters.some(filter => filter.isEnabled && filter.predicate(msg.text))
  ).slice(-MAX_DISPLAYED_MESSAGES);

  const getActiveFiltersLabel = () => {
    const activeCount = debugStore.messageFilters.filter(f => f.isEnabled).length;
    const totalCount = debugStore.messageFilters.length;
    return activeCount === totalCount ? 'All' : `${activeCount}/${totalCount}`;
  };

  const messageStyles = {
    base: {
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      lineHeight: 1.4,
      margin: '1px 0',
      padding: '1px 4px',
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'baseline'
    },
    rx: {
      color: 'var(--bs-success)',
      backgroundColor: 'var(--bs-success-bg-subtle)',
      borderLeft: '2px solid var(--bs-success)'
    },
    tx: {
      color: 'var(--bs-info)',
      backgroundColor: 'var(--bs-info-bg-subtle)',
      borderLeft: '2px solid var(--bs-info)',
      fontWeight: 500
    },
    error: {
      color: 'var(--bs-danger)',
      backgroundColor: 'var(--bs-danger-bg-subtle)',
      borderLeft: '2px solid var(--bs-danger)'
    },
    default: {
      color: 'var(--bs-secondary)',
      backgroundColor: 'var(--bs-secondary-bg-subtle)',
      borderLeft: '2px solid var(--bs-secondary)'
    },
    timestamp: {
      color: 'var(--bs-secondary)',
      fontSize: '0.8125rem',
      marginRight: '8px'
    },
    icon: {
      marginRight: '8px',
      fontSize: '0.75rem',
      width: '16px',
      textAlign: 'center'
    },
    content: {
      flex: 1
    }
  } as const;

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
                {debugStore.messageFilters.map(filter => (
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
                    onClick={() => debugStore.setAllMessageFiltersEnabled(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="w-50"
                    onClick={() => debugStore.setAllMessageFiltersEnabled(false)}
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
        {filteredMessages.map((msg, index) => {
          const type = getMessageType(msg.text);
          const icon = type === 'rx' ? 'bi-arrow-down-short'
            : type === 'tx' ? 'bi-arrow-up-short'
            : type === 'error' ? 'bi-exclamation-triangle-fill'
            : 'bi-info-circle';
          const typeStyle = type === 'rx' ? messageStyles.rx
            : type === 'tx' ? messageStyles.tx
            : type === 'error' ? messageStyles.error
            : messageStyles.default;

          return (
            <div style={{ ...messageStyles.base, ...typeStyle }} key={index}>
              <span style={messageStyles.timestamp}>[{formatTimestamp(msg.timestamp)}]</span>
              <i className={`bi ${icon}`} style={messageStyles.icon} />
              <span style={messageStyles.content}>{msg.text}</span>
            </div>
          );
        })}
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
