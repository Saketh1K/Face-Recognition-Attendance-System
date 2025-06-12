
import React, { useRef, useEffect, useState } from 'react';
import { Webcam } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  onFaceDetected: (imageData: string) => void;
  isRegistering: boolean;
  statusMessage: string;
  statusType: 'idle' | 'success' | 'warning' | 'registration';
}

const CameraView: React.FC<CameraViewProps> = ({
  onFaceDetected,
  isRegistering,
  statusMessage,
  statusType
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError('');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        onFaceDetected(imageData);
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (statusType) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'registration': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <Webcam className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Required</h3>
          <p className="text-gray-600 mb-4">{cameraError}</p>
          <Button onClick={startCamera}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-2xl font-bold text-center">Face Recognition Attendance</h1>
        </div>
        
        <div className="p-8">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg bg-black"
              style={{ aspectRatio: '4/3' }}
            />
            
            {/* Face detection overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 border-2 border-white border-dashed rounded-full opacity-50"></div>
              </div>
              <div className="absolute top-4 left-4 right-4">
                <div className={`p-3 rounded-lg border text-center font-medium ${getStatusColor()}`}>
                  {statusMessage}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={captureFrame}
                disabled={!cameraActive}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRegistering ? 'Capture for Registration' : 'Check Attendance'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
