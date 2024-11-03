import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
  createMemoryRouter,
} from 'react-router';

import Root from './routes/Root';
import RouterError from './components/RouterError';
import Status from './routes/Status';
import Controls from './routes/Controls';
import Settings from './routes/Settings';
import Debug from './routes/Debug';
import { RootStoreProvider, RootStore } from './stores/RootStore';
import NetworkSettings from './routes/Settings/NetworkSettings';
import BedSettings from './routes/Settings/BedSettings';
import ProbesSettings from './routes/Settings/ProbesSettings';
import RelaysSettings from './routes/Settings/RelaysSettings';
import GrblSettings from './routes/Settings/GrblSettings';
import { SerialServiceProvider } from './providers/SerialServiceProvider';

const router = createMemoryRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Root><RouterError/></Root>,
    children: [
      { path: '', element: <Status/>},
      { path: 'controls', element: <Controls/>},
      {
        path: 'settings',
        element: <Settings/>,
        children: [
          { path: 'grbl', element: <GrblSettings /> },
          { path: 'network', element: <NetworkSettings /> },
          { path: 'bed', element: <BedSettings /> },
          { path: 'probes', element: <ProbesSettings /> },
          { path: 'relays', element: <RelaysSettings /> },
        ]
      },
      { path: '/debug', element: <Debug/>},
    ]
  },
]);

const rootStore = new RootStore();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('app')!);
root.render(
  <RootStoreProvider value={rootStore}>
    <SerialServiceProvider>
      <RouterProvider router={router} />
    </SerialServiceProvider>
  </RootStoreProvider>
);
