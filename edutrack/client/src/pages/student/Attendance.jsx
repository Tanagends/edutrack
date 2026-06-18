import { useState, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

/**
 * The student pastes the QR JSON payload (from a shared link or manual entry).
 * In a real mobile-first app you'd integrate a camera QR scanner library like
 * html5-qrcode. For this scaffold we use manual JSON entry as a working fallback.
 */
const StudentAttendance = () => {
  const [input, setInput] = useState('');
  const [marking, setMarking] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleMark = async () => {
    setResult(null);
    let parsed;
    try {
      parsed = JSON.parse(input.trim());
    } catch {
      return toast.error('Invalid QR data — paste the JSON from the QR code');
    }

    const { sessionId, token } = parsed;
    if (!sessionId || !token) return toast.error('Missing sessionId or token in QR data');

    setMarking(true);
    try {
      const { data } = await api.post('/attendance/mark', { sessionId, token });
      setResult({ success: true, message: data.message });
      toast.success('Attendance marked! ✅');
      setInput('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Scan the QR shown by your faculty or paste the QR data below.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Data</label>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input h-28 resize-none font-mono text-xs"
            placeholder={'{"sessionId": "...", "token": "..."}'}
          />
          <p className="text-xs text-gray-400 mt-1">
            Paste the JSON payload from the QR code shown by your faculty.
          </p>
        </div>

        <button
          onClick={handleMark}
          disabled={marking || !input.trim()}
          className="btn-primary w-full"
        >
          {marking ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Marking...
            </span>
          ) : '✅ Mark Attendance'}
        </button>

        {result && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {result.success ? '✅' : '❌'} {result.message}
          </div>
        )}
      </div>

      <div className="card bg-orange-50 border border-orange-100">
        <h3 className="font-semibold text-gray-800 mb-2">📱 Camera QR Scanner</h3>
        <p className="text-sm text-gray-600">
          Camera-based scanning can be added using the <code className="text-xs bg-white px-1 py-0.5 rounded border">html5-qrcode</code> library.
          Install it and replace the textarea with a scanner component when needed.
        </p>
        <code className="block text-xs mt-2 bg-white p-2 rounded border text-gray-500">
          npm install html5-qrcode
        </code>
      </div>
    </div>
  );
};

export default StudentAttendance;
