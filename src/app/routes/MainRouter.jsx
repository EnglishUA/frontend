import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/home/HomePage';
import { APP_ROUTE_NAMES, appRoutes } from './appRoutes';

const MainRouter = () => {
  return (
    <Routes>
      <Route path={appRoutes[APP_ROUTE_NAMES.HOME].path} element={<HomePage />} />
    </Routes>
  );
};

export default MainRouter;
