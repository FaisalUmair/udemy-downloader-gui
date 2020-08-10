import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { store } from './redux/configureStore'
import { Provider } from 'react-redux';

import { MemoryRouter as Router } from 'react-router-dom';

import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
