import { useStore } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { UartStatus } from '../types/Stores';
import { useSerialService } from '../contexts/SerialServiceContext';
import { Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import splashscreen from '../../assets/splashscreen.svg';

const Splashscreen = observer(() => {
  const { serialStore, settingsStore } = useStore();
  const serialService = useSerialService();
  const [showSkip, setShowSkip] = useState(false);
  const hasError = serialStore.connectionState === UartStatus.Error;
  const isConnected = serialStore.connectionState === UartStatus.Connected;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 10000); // Show skip button after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    try {
      await serialService.connect();
    } catch (error) {
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

      {hasError ? (
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
          <p>Please connect to continue</p>
          <Button
            variant="primary"
            onClick={handleConnect}
            className="mb-2"
          >
            Connect
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
      )}
    </div>
  );
});

export default Splashscreen;
