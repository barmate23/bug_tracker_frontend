import { Mic, Square } from 'lucide-react';
import { useRef, useState } from 'react';

export default function VoiceInput({ value, onChange, rows = 5 }) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef(null);

  function toggleListening() {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('');
      onChange(`${value ? `${value} ` : ''}${transcript}`.trim());
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div>
      <div className="textarea-wrap">
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} />
        <button type="button" className={`mic-button ${listening ? 'listening' : ''}`} onClick={toggleListening} disabled={!supported} title="Dictate description">
          {listening ? <Square size={16} /> : <Mic size={16} />}
        </button>
      </div>
      <p className="field-note">{supported ? 'Click mic to dictate description' : 'Voice input is not supported in this browser'}</p>
    </div>
  );
}
