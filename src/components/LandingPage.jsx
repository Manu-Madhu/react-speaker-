import React, { useState, useEffect } from "react";

const LandingPage = () => {
    const [image, setImage] = useState('/assets/cover.png');
    const [ListeningImage, setListeningImage] = useState('/assets/listening.gif');
    const [isListening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [chatResponse, setChatResponse] = useState(false);

    // For API request loading state
    const [isLoading, setLoading] = useState(false);

    // dot animation 
    const [dots, setDots] = useState("");

    useEffect(() => {
        // Initialize the SpeechRecognition API (Web Speech API)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                const currentTranscript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setTranscript(currentTranscript);
            };

            recognitionInstance.onerror = (event) => {
                console.error("Speech recognition error", event.error);
            };

            setRecognition(recognitionInstance);
        } else {
            console.error("Speech recognition not supported in this browser.");
        }
    }, []);

    const startListening = () => {
        if (recognition) {
            recognition.start();
            setListening(true);
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setListening(false);
            setChatResponse(false)
            setListeningImage('/assets/listening.gif')
        }
    };

    // Reset listener and clear transcript
    const resetListening = () => {
        if (recognition) {
            recognition.stop();
        }
        setTranscript('');
        setChatResponse(false)
        setTimeout(() => { recognition.start(); }, 1000)
        setListeningImage('/assets/listening.gif');
    };

    // Submit transcript to API
    const submitTranscript = async () => {
        setLoading(true);
        setChatResponse(true)
        setListeningImage('/assets/speeking.gif');
        try {
            // Replace with actual API URL
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript }),
            });
            const result = await response.json();

            // Handle API response
            console.log('API Response:', result);

            // Change image back to listening state or response-based state
            setLoading(false);
        } catch (error) {
            console.error('Error submitting transcript:', error);
            setLoading(false);
        }
    };

    // animation
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 5 ? prev + "." : ""));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="bg-[#F5EFFF] flex items-center justify-center w-full min-h-screen p-5 lg:p-10 relative">
            {/* Main Section */}
            <section className="bg-white rounded-2xl shadow-lg flex flex-col items-center  relative w-full h-[90vh] p-5 lg:p-10">
                {/* Heading part */}
                <div className="flex flex-col w-full text-center uppercase mt-5">
                    <h1 className="font-bold text-4xl lg:text-[50px] lg:leading-[50px]">Meet our new virtual <br /> "<span className="text-purple-800">AI</span> Receptionist" <span className="text-purple-800">Quza</span></h1>
                </div>

                {/* Image */}
                <div className={` ${isListening || isLoading ? "hidden" : "block"} flex items-center justify-center absolute bottom-0`}>
                    <img src={image} alt="cover" className="w-fit h-[600px] lg:h-[5 00px] object-contain" />
                </div>

                {/* Buttons for Starting/Stopping Listening */}
                <div className="w-full lg:w-1/2 text-center absolute bottom-0">
                    {!isListening && (
                        <button onClick={startListening} className="bg-purple-800 text-white w-full p-3 px-10 rounded-lg lg:rounded-full">
                            Start Conversation
                        </button>
                    )}
                </div>
            </section>

            {/* After ask button click */}
            {isListening && (
                <section className="fixed h-screen w-screen top-0 left-0 bg-black/60 backdrop-blur-sm z-20">
                    {/* Side image */}
                    <div className={` ${isListening ? "block" : "hidden"} w-full h-2/4 flex items-center justify-center`}>
                        <img src={ListeningImage} alt="Listening" className="w-fit h-full object-cover" />
                    </div>

                    <div className="w-full flex flex-col items-center justify-center px-7">
                        {/* Display the captured text */}
                        <div className="bg-gray-200 p-5 rounded-t-md w-full lg:w-1/2 min-h-[200px]">
                            <p className="text-xl font-bold text-purple-800 uppercase mb-1">{chatResponse ? " Responding" : "Listening"} {dots}</p>
                            {transcript && (
                                <p className="text-lg capitalize">{transcript}</p>
                            )}
                        </div>

                        {/* Buttons Controller */}
                        <div className="flex w-full lg:w-1/2">
                            <button onClick={resetListening} className={`bg-purple-800  w-full text-white p-5 px-10 rounded-bl-lg`}>
                                {chatResponse ? "Ask another question" : " Restart Conversation"}
                            </button>

                            {/* Conditionally update button the submit and the stop  */}
                            {chatResponse ? (
                                <button onClick={stopListening} className="bg-red-600 w-full text-white p-5 px-10 rounded-br-lg">
                                    End Conversation
                                </button>
                            ) : (
                                <button onClick={submitTranscript} className="bg-green-600 w-full text-white p-5 px-10 rounded-br-lg">
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </section >
            )}
        </main >
    );
};

export default LandingPage;
