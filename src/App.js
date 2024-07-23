import React from 'react';
import Startup2048 from './Startup2048';
import './index.css';
import { Helmet } from 'react-helmet';

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>Exit Your Startup</title>
      </Helmet>
      <Startup2048 />
    </div>
  );
}

export default App;