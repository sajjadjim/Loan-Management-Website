'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Check, X, AlertTriangle, SwitchCamera } from 'lucide-react';
import styles from './CameraCaptureModal.module.css';
import { compressDataUrl } from '@/lib/imageCompressor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  title,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [compressing, setCompressing] = useState(false);

  // Initialize Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('আপনার ব্রাউজারে সরাসরি ক্যামেরা সমর্থন সমর্থিত নয়।');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(err.message || 'ক্যামেরা চালু করা সম্ভব হয়নি। ডিভাইসের পারমিশন চেক করুন।');
      }
    }

    if (isOpen && !capturedUrl) {
      startCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode, capturedUrl]);

  // Stop camera when closing
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setCapturedUrl(null);
    onClose();
  };

  // Snap image from video stream
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedUrl(rawDataUrl);

      // Stop camera stream while previewing captured photo
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedUrl(null);
  };

  // Confirm photo selection
  const handleConfirm = async () => {
    if (!capturedUrl) return;
    setCompressing(true);
    try {
      const compressed = await compressDataUrl(capturedUrl, 2000, 2400);
      onCapture(compressed);
      handleClose();
    } catch (err) {
      console.error('Data URL compression error', err);
      onCapture(capturedUrl);
      handleClose();
    } finally {
      setCompressing(false);
    }
  };

  // Switch between front & rear camera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Camera size={20} style={{ color: '#10b981' }} />
            <span>{title}</span>
          </div>
          <button onClick={handleClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Camera / Preview Viewport */}
        <div className={styles.viewport}>
          {capturedUrl ? (
            <img src={capturedUrl} alt="Captured preview" className={styles.previewImg} />
          ) : cameraError ? (
            <div className={styles.errorState}>
              <AlertTriangle size={40} />
              <p>{cameraError}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className={styles.video} />
              <div className={styles.frameGuide}>
                <span className={styles.guideBadge}>ফ্রেমে সোজা করে রাখুন</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          {capturedUrl ? (
            <>
              <button onClick={handleRetake} className="btn btn-secondary btn-sm">
                <RefreshCw size={15} />
                <span>পুনরায় তুলুন</span>
              </button>
              <button
                onClick={handleConfirm}
                disabled={compressing}
                className="btn btn-primary btn-sm"
              >
                <Check size={16} />
                <span>{compressing ? 'প্রসেস হচ্ছে...' : 'ছবি ব্যবহার করুন'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleToggleCamera}
                className="btn btn-secondary btn-sm"
                title="ক্যামেরা ফ্লিপ করুন"
              >
                <SwitchCamera size={16} />
                <span>ক্যামেরা পরিবর্তন</span>
              </button>

              <button
                onClick={handleSnap}
                disabled={!!cameraError}
                className={styles.snapBtn}
              >
                <Camera size={18} />
                <span>ছবি তুলুন</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
