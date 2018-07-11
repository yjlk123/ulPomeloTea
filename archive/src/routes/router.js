import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import IndexPage from '../pages/IndexPage';
import LoginPage from '../pages/login/LoginPage'
import PersonalManagement from  '../pages/management/PersonalManagement'
import MapRouter from './router-map'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={IndexPage} />
        <Route path="/login" exact component={LoginPage} />
				<Route path="/management" exact component={PersonalManagement} />
        <MapRouter></MapRouter>
      </Switch>
    </Router>
  );
}

export default RouterConfig;
