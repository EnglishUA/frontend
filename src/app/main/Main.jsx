import React from 'react';
import { Box } from '@mui/material';
import MainRouter from '../routes/MainRouter';

const Main = () => {
  return (
    <Box>
      <Box>{/*TODO: header*/}</Box>
      <MainRouter />
      <Box>{/*TODO: footer*/}</Box>
    </Box>
  );
};

export default Main;
