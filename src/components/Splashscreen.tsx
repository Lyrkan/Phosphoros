import { useStore } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { UartStatus } from '../types/Stores';
import { useSerialService } from '../contexts/SerialServiceContext';
import { Button, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

import splashscreen from '../../assets/splashscreen.svg';

const CONNECT_MAX_RETRIES = 5;
const CONNECT_RETRY_DELAY_MS = 1000;

const Splashscreen = observer(() => {
  const { serialStore, settingsStore } = useStore();
  const serialService = useSerialService();
  const [showSkip, setShowSkip] = useState(globalThis.isDev ? true : false);
  const hasError = serialStore.connectionState === UartStatus.Error;
  const isConnecting = serialStore.connectionState === UartStatus.Connecting;
  const isConnected = serialStore.connectionState === UartStatus.Connected;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    try {
      await serialService.connect({
        maxRetries: CONNECT_MAX_RETRIES,
        retryDelayMs: CONNECT_RETRY_DELAY_MS,
      });
    } catch {
      // Error handling is already done in SerialService
    }
  };

  const handleSkip = () => {
    settingsStore.setIsLoaded(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, #003366, #004080)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <img
        src={splashscreen}
        alt="Loading"
        style={{
          width: '300px',
          height: '300px',
          marginBottom: '2rem'
        }}
      />

      {isConnecting ? (
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <Spinner animation="border" variant="light" className="mb-3" />
          <p>Connecting...</p>
          {showSkip && (
            <div>
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-white"
              >
                Skip Loading
              </Button>
            </div>
          )}
        </div>
      ) : hasError ? (
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <p>Connection failed: {serialStore.error}</p>
          <Button
            variant="primary"
            onClick={handleConnect}
            className="mb-2"
          >
            Retry Connection
          </Button>
          {showSkip && (
            <div>
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-white"
              >
                Skip Loading
              </Button>
            </div>
          )}
        </div>
      ) : isConnected && !settingsStore.isLoaded ? (
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <p>Retrieving settings...</p>
          <Button
            variant="warning"
            onClick={handleConnect}
            className="mb-2"
          >
            Reconnect
          </Button>
          {showSkip && (
            <div>
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-white"
              >
                Skip Loading
              </Button>
            </div>
          )}
        </div>
      ) : settingsStore.isLoaded ? (
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <p>Connected successfully!</p>
        </div>
      ) : (
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <Button
            variant="info"
            onClick={handleConnect}
            className="mb-2"
          >
            <i className="bi bi-rocket-takeoff me-2"></i>
            Connect
          </Button>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.8rem'
        }}
      >
        Build: {process.env.GIT_COMMIT_HASH || 'unknown'} ({process.env.BUILD_DATE ? format(new Date(process.env.BUILD_DATE), 'yyyy-MM-dd HH:mm') : 'unknown'})
      </div>
    </div>
  );
});

export default Splashscreen;
