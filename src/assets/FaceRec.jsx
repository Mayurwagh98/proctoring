import React, { useRef, useEffect } from "react";
import {
  RekognitionClient,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";

const FaceRecognitionWithVideo = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Configure Rekognition Client
  const rekognitionClient = new RekognitionClient({
    region: "your-region",
    credentials: {
      accessKeyId: "your-access-key-id",
      secretAccessKey: "your-secret-access-key",
    },
  });

  useEffect(() => {
    // Access webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  }, []);

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    // Draw the current video frame on the canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    canvas.toBlob(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const params = {
        CollectionId: "MyCollection", // Replace with your collection ID
        Image: {
          Bytes: uint8Array,
        },
      };

      try {
        const command = new SearchFacesByImageCommand(params);
        const response = await rekognitionClient.send(command);
        console.log("Face Recognition Response:", response);
      } catch (error) {
        console.error("Error recognizing face:", error);
      }
    }, "image/jpeg");
  };

  return (
    <div>
      <h1>Face Recognition with AWS Rekognition</h1>
      <video ref={videoRef} autoPlay width={400} height={300}></video>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{ display: "none" }}
      ></canvas>
      <button onClick={captureFrame}>Capture & Recognize</button>
    </div>
  );
};

export default FaceRecognitionWithVideo;
