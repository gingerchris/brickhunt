import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

interface OCRScannerProps {
  onPartsDetected: (partNumbers: string[]) => void;
  onClose: () => void;
}

export function OCRScanner({ onPartsDetected, onClose }: OCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseWebcam(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current && useWebcam) {
      const video = videoRef.current;
      video.srcObject = stream;

      const playVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          console.error('Error playing video:', err);
        }
      };

      video.onloadedmetadata = () => {
        playVideo();
      };
    }
  }, [stream, useWebcam]);

  const extractPartNumbers = (text: string): string[] => {
    const patterns = [
      /\b\d{4,6}[a-z]?\b/gi,
      /(?:part|id|num|no)[:\s]+(\d{4,6}[a-z]?)/gi,
    ];

    const found = new Set<string>();

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const partNum = match[1] || match[0];
        if (partNum.length >= 4) {
          found.add(partNum.toLowerCase());
        }
      }
    }

    return Array.from(found);
  };

  const processImage = async (imageSource: string | File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(imageSource, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const partNumbers = extractPartNumbers(result.data.text);

      if (partNumbers.length > 0) {
        onPartsDetected(partNumbers);
      } else {
        alert('No part numbers detected. Please try a clearer photo.');
        setIsProcessing(false);
        setProgress(0);
      }
    } catch (err) {
      console.error('OCR error:', err);
      alert('Failed to process image. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    await processImage(file);
  };

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      setUseWebcam(true);
      setStream(mediaStream);
    } catch (err) {
      console.error('Webcam error:', err);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const captureFromWebcam = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');
    setPreview(imageData);
    stopWebcam();
    processImage(imageData);
  };

  const handleClose = () => {
    stopWebcam();
    onClose();
  };

  const handleBackToOptions = () => {
    stopWebcam();
    setPreview(null);
    setIsProcessing(false);
    setProgress(0);
  };

  return (
    <div className="ocr-scanner-overlay">
      <div className="ocr-scanner-container">
        <div className="ocr-scanner-header">
          <h2>Scan Part Number from Manual</h2>
          <button type="button" onClick={handleClose} className="close-btn">✕</button>
        </div>

        <div className="ocr-content">
          {!useWebcam && !preview && !isProcessing && (
            <div className="input-method-selection">
              <button type="button" onClick={startWebcam} className="method-btn webcam-btn">
                <span className="method-icon">📹</span>
                <span>Use Webcam</span>
              </button>

              <div className="method-divider">or</div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="file-input"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="method-btn photo-btn">
                <span className="method-icon">📸</span>
                <span>Take/Upload Photo</span>
              </label>
            </div>
          )}

          {useWebcam && (
            <div className="webcam-container">
              <video ref={videoRef} className="webcam-preview" autoPlay playsInline muted></video>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              <div className="webcam-controls">
                <button type="button" onClick={stopWebcam} className="secondary-btn">
                  Cancel
                </button>
                <button type="button" onClick={captureFromWebcam} className="primary-btn capture-btn">
                  📷 Capture
                </button>
              </div>
            </div>
          )}

          {preview && !useWebcam && (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
              {!isProcessing && (
                <button type="button" onClick={handleBackToOptions} className="secondary-btn back-btn">
                  ← Try Again
                </button>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="processing-status">
              <div className="spinner"></div>
              <p>Processing image... {progress}%</p>
              <p className="processing-hint">Detecting part numbers...</p>
            </div>
          )}

          {!useWebcam && !preview && !isProcessing && (
            <p className="ocr-instructions">
              Use your webcam or take a photo of the part number(s) in your LEGO instruction manual.
              The app will detect all visible part numbers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
