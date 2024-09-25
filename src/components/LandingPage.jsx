import React, { useState, useEffect } from "react";

const LandingPage = () => {
    const [image, setImage] = useState('/assets/cover.png');
    const [ListeningImage, setListeningImage] = useState('/assets/listening.gif');
    const [isListening, setListening] = useState(false);
    const [isLoading, setLoading] = useState(false); // For API request loading state
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

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
        }
    };

    // Reset listener and clear transcript
    const resetListening = () => {
        if (recognition) {
            recognition.stop();
        }
        setTranscript('');
        setTimeout(() => { recognition.start(); }, 1000)
        setListeningImage('/assets/listening.gif'); // Reset image back to default
    };

    // Submit transcript to API
    const submitTranscript = async () => {
        setLoading(true); // Set loading to true (show processing image)
        setListeningImage('/assets/speeking.gif'); // Change image to speaking state
        try {
            const response = await fetch('/api/submit', { // Replace with actual API URL
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

    return (
        <main className="bg-[#F5EFFF] flex items-center justify-center w-full min-h-screen p-10 relative">
            {/* Main Section */}
            <section className="bg-white rounded-2xl shadow-lg flex flex-col items-center lg:items-start relative w-full h-[90vh] p-5 lg:p-10">
                {/* Heading part */}
                <div className="flex flex-col w-full lg:w-1/2 mt-5">
                    <h1 className="font-bold text-4xl lg:text-[80px]">Meet Tessa</h1>
                    <p className="font-semibold text-2xl lg:text-[40px] mt-7">Our New Virtual Receptionist</p>
                </div>

                {/* Question */}
                <div className="mt-5 bg-[#a967aa] p-5 lg:py-10 rounded-2xl text-white my-5 lg:my-10">
                    <h1 className="text-4xl font-semibold">Ask Your Question About Digital ........</h1>
                </div>

                {/* Buttons for Starting/Stopping Listening */}
                {!isListening && (
                    <button onClick={startListening} className="bg-blue-600 text-white p-3 px-10 rounded-full">
                        Ask Now
                    </button>
                )}

                {/* Image */}
                <div className={`absolute -bottom-10 lg:right-10 ${isListening || isLoading ? "hidden" : "block"}`}>
                    <img src={image} alt="cover" className="w-fit object-contain" />
                </div>
            </section>

            {isListening && (
                <section className="fixed h-screen w-screen top-0 left-0 bg-black/60 backdrop-blur-sm z-20">
                    {/* Side image */}
                    <div className={`absolute -bottom-10 lg:right-10 ${isListening ? "block" : "hidden"}`}>
                        <img src={ListeningImage} alt="Listening" className="w-fit h-[550px] object-contain" />
                    </div>

                    <div className="w-full lg:w-2/3 h-full flex flex-col items-center  justify-center">
                        {/* Display the captured text */}

                        <div className="mt-5 bg-gray-200 p-5 rounded-md w-full lg:w-1/2 min-h-[200px]">
                            <p className="text-xl font-semibold">Captured Text:</p>
                            {transcript && (
                                <p className="text-lg">{transcript}</p>
                            )}
                        </div>



                        <div className="flex gap-4 mt-5">
                            <button onClick={stopListening} className="bg-red-600 w-fit  text-white p-3 px-10 rounded-xl">
                                Stop Listening
                            </button>
                            <button onClick={resetListening} className="bg-gray-600 w-fit text-white p-3 px-10 rounded-xl">
                                Reset
                            </button>
                            <button onClick={submitTranscript} className="bg-green-600 w-fit text-white p-3 px-10 rounded-xl">
                                Submit
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default LandingPage;
