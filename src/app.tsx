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
import { RootStoreProvider, rootStore } from './stores/RootStore';
import MainSettings from './routes/Settings/MainSettings';
import NetworkSettings from './routes/Settings/NetworkSettings';
import BedSettings from './routes/Settings/BedSettings';
import ProbesSettings from './routes/Settings/ProbesSettings';
import RelaysSettings from './routes/Settings/RelaysSettings';
import GrblSettings from './routes/Settings/GrblSettings';

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
          { path: '', element: <MainSettings /> },
          { path: 'network', element: <NetworkSettings /> },
          { path: 'bed', element: <BedSettings /> },
          { path: 'probes', element: <ProbesSettings /> },
          { path: 'relays', element: <RelaysSettings /> },
          { path: 'grbl', element: <GrblSettings /> },
        ]
      },
      { path: '/debug', element: <Debug/>},
    ]
  },
]);

const root = createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <RootStoreProvider value={rootStore}>
      <RouterProvider router={router}/>
    </RootStoreProvider>
  </React.StrictMode>
);
