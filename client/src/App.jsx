import { Routes, Route } from 'react-router-dom';

import MainVideo from './routes/mainVideo/mainVideo';

import './App.css';

const Home = () => {
  return <h1>test routes rendering</h1>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join-video" element={<MainVideo />} />
    </Routes>
  );
}

export default App;
