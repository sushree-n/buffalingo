import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';

//for running locally comment the API BASE hosted on render and uncomment the localhost
// const API_BASE = 'http://127.0.0.1:5000';
const API_BASE = 'https://buffalingo-backend.onrender.com';
const popSound = new Audio('/pop.mp3');

type HistoryItem = {
  prompt: string;
  response: string;
  feedback: string;
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchPrompt = async () => {
    try {
      const res = await axios.get(`${API_BASE}/prompt`);
      setPrompt(res.data.prompt);
      setResponse('');
    } catch (err) {
      console.error("Error loading prompt:", err);
      setPrompt('⚠️ Error loading prompt');
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitResponse = async () => {
    if (!response.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/evaluate`, {
        prompt,
        response: response.trim(),
      });

      let feedback = res.data.feedback || 'No response';
      feedback = feedback.replace(/Score:\s*\d+(\.\d+)?/gi, '').trim();
      const points = Number(res.data.score) === 1 ? 1 : 0;

      // Confetti for 716 Easter Egg
      if (response.trim().toLowerCase() === "716") {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#ffffff', '#0052cc'], // Red, White, Blue
        });
        // Play sound
        popSound.currentTime = 0; // Rewind if playing
        popSound.play();
      }

      setScore(prev => prev + points);
      setHistory(prev => [...prev, { prompt, response: response.trim(), feedback }]);
      setResponse('');
      setTimeout(fetchPrompt, 100);
    } catch (err) {
      console.error("Evaluation error:", err);
    }

    setLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  useEffect(() => {
    fetchPrompt();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-red-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-blue-700 p-6 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-800">BuffaLingo 🦬</h1>

        <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
          <div>🏆 <strong>Score:</strong> {score}</div>
          <div>🎯 <strong>Rounds:</strong> {history.length}</div>
        </div>

        <div className="h-72 overflow-y-auto bg-gray-100 rounded-xl p-4 space-y-4 shadow-inner">
          {history.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg w-fit">
                <strong>🧩 Prompt:</strong> {item.prompt}
              </div>
              <div className="flex justify-end">
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg w-fit">
                  <strong>🙋 You:</strong> {item.response}
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg w-fit">
                🧠 {item.feedback}
              </div>
              <hr className="border-gray-300" />
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="text-lg font-semibold text-blue-900">
          📣 Prompt: <span className="text-blue-600">{prompt}</span>
        </div>

        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response..."
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={submitResponse}
            disabled={loading || !response.trim()}
            className={`px-6 py-2 text-white text-lg font-semibold rounded-xl shadow transition-transform duration-200 ${
              loading || !response.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 active:scale-95'
            }`}
          >
            {loading ? 'Evaluating...' : 'Submit'}
          </button>
          <button
            onClick={fetchPrompt}
            className="px-6 py-2 text-lg font-semibold rounded-xl border border-blue-700 text-blue-700 hover:bg-blue-50 active:scale-95 transition-transform"
          >
            New Prompt
          </button>
          <button
            onClick={() => {
              setHistory([]);
              setScore(0);
              fetchPrompt();
            }}
            className="px-6 py-2 text-lg font-semibold rounded-xl border border-red-600 text-red-600 hover:bg-red-50 active:scale-95 transition-transform"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
