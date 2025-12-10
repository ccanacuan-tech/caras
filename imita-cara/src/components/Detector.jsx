
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera } from '@capacitor/camera';
import { loadModels } from "../utils/loadModels";

export default function Detector({ targetExpression, setScore, score }) {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [status, setStatus] = useState("Iniciando...");

  // Cargar los modelos y gestionar el estado
  useEffect(() => {
    const loadAllModels = async () => {
      try {
        setStatus("Cargando modelos...");
        await loadModels();
        setModelsLoaded(true);
        setStatus("¡Modelos cargados!");
      } catch (err) {
        console.error("Error loading models: ", err);
        setStatus("Error al cargar los modelos");
      }
    };
    loadAllModels();
  }, []);

  // Iniciar la cámara
  useEffect(() => {
    const startCam = async () => {
      try {
        const permission = await Camera.requestPermissions();
        if (permission.camera !== 'granted') {
          setStatus('Permiso de cámara denegado');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setStatus("Error al acceder a la cámara");
      }
    };

    startCam();

    // Limpieza
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }, []);

  // Analizar la cara
  useEffect(() => {
    if (videoRef.current && modelsLoaded && videoStream) {
      const analyze = async () => {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          // Una vez que la detección funciona, podemos limpiar el estado
          if (status) setStatus(null);

          const prediction = detections.expressions[targetExpression];
          const currentScore = (prediction * 100).toFixed(0);
          setScore(currentScore);
        }
      };

      const interval = setInterval(analyze, 500);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, videoStream, targetExpression, setScore, status]);

  return (
    <div>
      {status && <div className="status">{status}</div>}
      <video ref={videoRef} autoPlay muted playsInline className="video" />
      <h2>Coincidencia: {score}%</h2>
    </div>
  );
}
