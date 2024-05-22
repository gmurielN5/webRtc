import { Routes, Route } from 'react-router-dom';

import { MainVideo } from './routes/mainVideo/mainVideo';
import { Dashboard } from './routes/Dashboard/Dashboard';

const Home = () => {
  return <h1>Hello, Home page</h1>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" Component={Dashboard} />
      <Route path="/join-video" element={<MainVideo />} />
    </Routes>
  );
}

export default App;
