import React from 'react';

import { Route, Switch } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import 'antd/dist/antd.css';
import "./App.css";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path={["/", "/dashboard/courses"]} component={Dashboard} exact />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
      </Switch>
    </div>
  );
}

export default App;
