import './App.css';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <div className="h-screen overflow-hidden">
      <LandingPage />
    </div>
  );
}

export default App;


// const stopListening = () => {
//   setListeningImage('/assets/listening.gif')
//   setImage('/assets/cover.png')
//   if (recognition) {
//       recognition.stop();
//       setListening(false);
//   }
// };