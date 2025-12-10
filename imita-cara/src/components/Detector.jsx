
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "../utils/loadModels";

export default function Detector({ targetExpression }) {
  const videoRef = useRef();
  const [score, setScore] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadAllModels = async () => {
      await loadModels();
      setModelsLoaded(true);
    };
    loadAllModels();
  }, []);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const analyze = async () => {
    if (videoRef.current && modelsLoaded) {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const prediction = detections.expressions[targetExpression];
        setScore((prediction * 100).toFixed(0)); // %
      }
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      startCam();
    }
  }, [modelsLoaded]);

  useEffect(() => {
    if (modelsLoaded) {
      const interval = setInterval(analyze, 500);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted className="video" />
      <h2>Coincidencia: {score}%</h2>
    </div>
  );
}
