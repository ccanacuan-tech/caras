
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera } from '@capacitor/camera';
import { loadModels } from "../utils/loadModels";

export default function Detector({ targetExpression, setScore, score }) {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  // Cargar los modelos
  useEffect(() => {
    const loadAllModels = async () => {
      await loadModels();
      setModelsLoaded(true);
    };
    loadAllModels();
  }, []);

  // Iniciar la cámara
  useEffect(() => {
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

    startCam();

    // Limpieza: detener la cámara cuando el componente se desmonte
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }, []);

  // Analizar la cara cuando los modelos y el video estén listos
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
  }, [modelsLoaded, videoStream, targetExpression, setScore]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline className="video" />
      <h2>Coincidencia: {score}%</h2>
    </div>
  );
}
