import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { History, createBrowserHistory as createHistory } from 'history';
// import { History, createHashHistory as createHistory } from 'history';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { createLogger } from 'redux-logger';

import reducers from './reducers';
import rootSaga from './sagas';
import Application from './containers/Application';

// Middlewares
const middlewares = [];

const logger = createLogger();
const history: History = createHistory();
const sagaMiddleware = createSagaMiddleware();

middlewares.push(routerMiddleware(history));
middlewares.push(sagaMiddleware);
middlewares.push(logger);

// Create store
// Note: midddlewares applying order.
const store = createStore(reducers, applyMiddleware(...middlewares));

// Run Saga
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Application />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
// registerServiceWorker();
