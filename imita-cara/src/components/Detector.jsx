
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, CameraResultType } from '@capacitor/camera';
import { loadModels } from "../utils/loadModels";

export default function Detector({ targetExpression, setScore, score }) {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  useEffect(() => {
    const loadAllModels = async () => {
      await loadModels();
      setModelsLoaded(true);
    };
    loadAllModels();
  }, []);

  const startCam = async () => {
    try {
      const permission = await Camera.requestPermissions();
      if (permission.camera !== 'granted') {
        console.error('Camera permission not granted');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      startCam();
    }
  }, [modelsLoaded]);

  useEffect(() => {
    const analyze = async () => {
      if (videoRef.current && modelsLoaded && videoStream) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          const prediction = detections.expressions[targetExpression];
          const currentScore = (prediction * 100).toFixed(0);
          setScore(currentScore);
        }
      }
    };

    if (modelsLoaded && videoStream) {
      const interval = setInterval(analyze, 500);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, targetExpression, setScore, videoStream]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline className="video" />
      <h2>Coincidencia: {score}%</h2>
    </div>
  );
}
