import React, { useRef, useState } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [audioURL, setAudioURL] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recorded_audio.webm');

      const formData = new FormData();
      formData.append('audio', audioFile);

      try {
        const res = await axios.post('http://localhost:5000/upload', formData);
        setAudioURL(`http://localhost:5000/audio/${res.data.file.filename}`);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🎙️ Audio Recorder</h2>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {audioURL && (
        <div style={{ marginTop: '1rem' }}>
          <h4>🎧 Playback:</h4>
          <audio controls src={audioURL}></audio>
          <p><a href={audioURL} download>Download Audio</a></p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
