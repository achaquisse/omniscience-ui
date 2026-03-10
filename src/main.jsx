import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createRoutesFromChildren, matchRoutes, Routes, useLocation, useNavigationType} from 'react-router-dom';
import {
  createReactRouterV7Options,
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration
} from '@grafana/faro-react';
import {TracingInstrumentation} from '@grafana/faro-web-tracing';

initializeFaro({
  url: 'https://faro-collector-prod-eu-west-2.grafana.net/collect/301f98bd832f440cdb11ef47a74d55f1',
  app: {
    name: 'omniscience-ui',
    version: '1.0.0',
    environment: window.location.hostname === 'localhost' ? 'development' : 'production'
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation(),
    new ReactIntegration({
      router: createReactRouterV7Options({
        createRoutesFromChildren,
        matchRoutes,
        Routes,
        useLocation,
        useNavigationType,
      }),
    }),
  ],
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
