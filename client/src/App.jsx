import { Routes, Route } from 'react-router-dom';

import { Dashboard } from './routes/Dashboard/Dashboard';
import { MainVideo } from './routes/mainVideo/mainVideo';
import { ProMainVideo } from './routes/ProMainVideo/ProMainVideo';

const Home = () => {
  return <h1>Hello, Home page</h1>;
};

export const App = () => {
  return (
    <Routes>
      <Route path="/" Component={Home} />
      <Route path="/dashboard" Component={Dashboard} />
      <Route path="/join-video" Component={MainVideo} />
      <Route path="/join-video-pro" Component={ProMainVideo} />
    </Routes>
  );
};
