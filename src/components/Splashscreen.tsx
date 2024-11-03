import { useStore } from '../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { UartStatus } from '../types/Stores';

import splashscreen from '../../assets/splashscreen.svg';

const Splashscreen = observer(() => {
  const { serialStore } = useStore();
  const hasError = serialStore.connectionState === UartStatus.Error;

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
          <p>Retrying in a few seconds...</p>
        </div>
      ) : (
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <p>Loading settings...</p>
        </div>
      )}
    </div>
  );
});

export default Splashscreen;
