import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { baseUrl } from '../utils/Url';

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

const LandingPage = () => {
  const [image, setImage] = useState('/assets/cover.png');
  const [ListeningImage, setListeningImage] = useState(
    `/assets/listening${getRandomInt(2)}.gif`
  );
  const [isListening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [chatResponse, setChatResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [socket, setSocket] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // dot animation
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Initialize the SpeechRecognition API (Web Speech API)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

  const startConversation = () => {
    setSocket(io(baseUrl));
    startListening();
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      socket.disconnect();
      setListening(false);
      setChatResponse(false);
      setListeningImage(`/assets/listening${getRandomInt(2)}.gif`);
    }
  };

  // Reset listener and clear transcript
  const resetListening = () => {
    if (recognition) {
      recognition.stop();
    }

    setTranscript('');
    setChatResponse(false);
    try {
      recognition.start();
    } catch {}
    setListeningImage(`/assets/listening${getRandomInt(2)}.gif`);
  };

  const submitTranscript = async () => {
    setLoading(true);
    try {
      socket.emit('prompt', transcript);
      setTranscript('');
      setLoading(false);
    } catch (error) {
      console.error('Error submitting transcript:', error);
      setLoading(false);
    }
  };

  const handleResponse = (response) => {
    if (response.status === 'error')
      return console.error('Error submitting transcript:', response.content);

    setChatResponse(true);
    setResponseText(response.content.responseText);

    const audioBlob = new Blob([response.content.responseAudio], {
      type: 'audio/mp3',
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.addEventListener('ended', () => {
      setIsResponding(false);
      setListeningImage('/assets/standby.gif');
    });
    audio.play();
    setIsResponding(true);
    setListeningImage(`/assets/speaking${getRandomInt(4)}.gif`);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('response', handleResponse);

    return () => socket.off('response', handleResponse);
  }, [socket, responseText]);

  // animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 5 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-[#F5EFFF] flex items-center justify-center w-full min-h-screen p-5 lg:p-10 relative">
      {/* Main Section */}
      <section className="bg-white rounded-2xl shadow-lg flex flex-col items-center  relative w-full h-[90vh] p-5 lg:p-10">
        {/* Heading part */}
        <div className="flex flex-col w-full mt-5 text-center capitalize">
          <h1 className="font-bold text-4xl lg:text-[50px] lg:leading-[50px]">
            Meet
            <a
              href="https://qmarktechnolabs.com/"
              target="blank"
              className="text-purple-800 duration-300 ease-in-out hover:underline"
            >
              {' '}
              Qmark's
            </a>{' '}
            new virtual <br /> "<span className="text-purple-800">AI</span>{' '}
            Receptionist" <span className="text-purple-800">Quza</span>
          </h1>
        </div>

        {/* Image */}
        <div
          className={` ${
            isListening || isLoading ? 'hidden' : 'block'
          } flex items-center justify-center absolute bottom-0`}
        >
          <img
            src={image}
            alt="cover"
            className="w-fit h-[600px] lg:h-[500px] object-contain"
          />
        </div>

        {/* Buttons for Starting/Stopping Listening */}
        <div className="absolute bottom-0 w-full text-center lg:w-1/2">
          {!isListening && (
            <button
              onClick={startConversation}
              className="w-full p-3 px-10 text-white bg-purple-800 rounded-lg lg:rounded-full"
            >
              Talk with Quza
            </button>
          )}
        </div>
        <a
          href="https://docs.google.com/forms/d/1IxskRJAmXe9rtQDYAvJ3117wFd8VEcdeHGqvGJ5Ecm4/edit"
          target="blank"
          className="absolute text-center w-fit bottom-10 lg:bottom-8 right-5"
        >
          <button className="w-full p-3 px-10 text-white bg-purple-800 rounded-lg lg:rounded-full">
            Enquire now
          </button>
        </a>
        <a
          href="https://qmarktechnolabs.com/"
          target="blank"
          className="absolute text-center w-fit bottom-10 lg:bottom-8 left-5"
        >
          <button className="w-full p-3 px-10 text-white bg-purple-800 rounded-lg lg:rounded-full">
            Visit Us
          </button>
        </a>
      </section>

      {/* After ask button click */}
      {isListening && (
        <section
          className="fixed top-0 left-0 z-20 w-screen h-screen bg-black/60 backdrop-blur-sm"
          // style={{
          //     backgroundImage: `url('/assets/bg.jpg')`,
          //     backgroundSize: 'cover',
          //     backgroundPosition: 'center'
          // }}
        >
          {/* Side image */}
          <div
            className={` ${
              isListening ? 'block' : 'hidden'
            } w-full h-2/4 flex items-center justify-center`}
          >
            <img
              src={ListeningImage}
              alt="Listening"
              className="object-cover h-full w-fit"
            />
          </div>

          <div className="flex flex-col items-center justify-center w-full px-7">
            {/* Display the captured text */}
            <div className="bg-gray-200 p-5 rounded-t-md w-full lg:w-1/2 min-h-[200px]">
              <p className="mb-1 text-xl font-bold text-purple-800 uppercase">
                {chatResponse ? ' Responding' : 'Listening'} {dots}
              </p>
              {transcript && (
                <p className="text-lg capitalize">
                  {chatResponse ? responseText : transcript}
                </p>
              )}
            </div>

            {/* Buttons Controller */}
            <div className="flex w-full lg:w-1/2">
              <button
                onClick={resetListening}
                className={`bg-purple-800  w-full text-white p-5 px-10 rounded-bl-lg`}
                disabled={isResponding}
              >
                {chatResponse ? 'Ask another question' : 'Restart Conversation'}
              </button>

              {/* Conditionally update button the submit and the stop  */}
              {chatResponse ? (
                <button
                  disabled={isResponding}
                  onClick={stopListening}
                  className="w-full p-5 px-10 text-white bg-red-600 rounded-br-lg"
                >
                  End Conversation
                </button>
              ) : (
                <button
                  onClick={submitTranscript}
                  className="w-full p-5 px-10 text-white bg-green-600 rounded-br-lg"
                  disabled={transcript === ''}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default LandingPage;
