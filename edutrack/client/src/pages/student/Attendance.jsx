import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SCANNER_ID = 'qr-reader';

const StudentAttendance = () => {
  const [scanning, setScanning] = useState(false);
  const [marking, setMarking] = useState(false);
  const [result, setResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false); // prevent double-fire on rapid frames

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // already stopped — ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const markAttendance = useCallback(async (sessionId, token) => {
    setMarking(true);
    try {
      const { data } = await api.post('/attendance/mark', { sessionId, token });
      setResult({ success: true, message: data.message });
      toast.success('Attendance marked! ✅');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  }, []);

  const handleDecodedText = useCallback(async (decodedText) => {
    if (hasScannedRef.current) return; // ignore subsequent frames
    hasScannedRef.current = true;

    let parsed;
    try {
      parsed = JSON.parse(decodedText);
    } catch {
      toast.error('Unrecognized QR code');
      hasScannedRef.current = false;
      return;
    }

    const { sessionId, token } = parsed;
    if (!sessionId || !token) {
      toast.error('This QR code is not an EduTrack attendance code');
      hasScannedRef.current = false;
      return;
    }

    await stopScanner();
    await markAttendance(sessionId, token);
  }, [stopScanner, markAttendance]);

  const startScanner = async () => {
    setResult(null);
    setCameraError(null);
    hasScannedRef.current = false;
    setScanning(true);

    // Give the DOM a tick to render the #qr-reader div before attaching
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = html5Qr;

        await html5Qr.start(
          { facingMode: 'environment' }, // back camera on mobile
          { fps: 10, qrbox: { width: 240, height: 240 } },
          handleDecodedText,
          () => {} // ignore per-frame scan failures (normal while aiming)
        );
      } catch (err) {
        console.error(err);
        setCameraError('Could not access camera. Check permissions or use manual entry below.');
        setScanning(false);
      }
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualMark = async () => {
    let parsed;
    try {
      parsed = JSON.parse(manualInput.trim());
    } catch {
      return toast.error('Invalid QR data — paste the JSON from the QR code');
    }
    const { sessionId, token } = parsed;
    if (!sessionId || !token) return toast.error('Missing sessionId or token in QR data');
    await markAttendance(sessionId, token);
    setManualInput('');
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Scan the QR code shown by your faculty using your camera.
        </p>
      </div>

      <div className="card space-y-4">
        {!scanning && !result && (
          <button onClick={startScanner} className="btn-primary w-full">
            📷 Start Camera Scanner
          </button>
        )}

        {scanning && (
          <div className="space-y-3">
            <div id={SCANNER_ID} className="rounded-xl overflow-hidden border border-gray-200" />
            <button onClick={stopScanner} className="btn-secondary w-full text-sm">
              Cancel Scan
            </button>
          </div>
        )}

        {cameraError && (
          <div className="rounded-lg px-4 py-3 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200">
            ⚠️ {cameraError}
          </div>
        )}

        {marking && (
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-2">
            <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Marking attendance...
          </div>
        )}

        {result && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {result.success ? '✅' : '❌'} {result.message}
          </div>
        )}

        {result && (
          <button
            onClick={() => { setResult(null); startScanner(); }}
            className="btn-secondary w-full text-sm"
          >
            Scan Another
          </button>
        )}
      </div>

      {/* Manual fallback */}
      <div className="card">
        <button
          onClick={() => setShowManual((v) => !v)}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          {showManual ? 'Hide manual entry' : "Camera not working? Enter QR data manually →"}
        </button>

        {showManual && (
          <div className="space-y-3 mt-4">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="input h-24 resize-none font-mono text-xs"
              placeholder='{"sessionId": "...", "token": "..."}'
            />
            <button
              onClick={handleManualMark}
              disabled={marking || !manualInput.trim()}
              className="btn-primary w-full text-sm"
            >
              Mark Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
