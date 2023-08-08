import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxStateProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persist } from './app/redux/store';
import EnglishUaApp from './app/EnglishUaApp';

import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
      <ReduxStateProvider store={store}>
        <PersistGate persistor={persist}>
          <EnglishUaApp />
        </PersistGate>
      </ReduxStateProvider>
    </BrowserRouter>
  </StrictMode>
);
