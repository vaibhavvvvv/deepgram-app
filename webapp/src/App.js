import React, { useState } from 'react';
import { Button, Upload, message, Card, Typography, Spin } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Text } = Typography;

const App = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState([]);
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file) => {
    setAudioFile(file);
    return false; 
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      message.error('Please select an audio file first.');
      return;
    }
    

    setLoading(true); 

    const formData = new FormData();
    formData.append('audio_file', audioFile);

    try {
      const response = await axios.post('http://35.182.230.233:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTranscription(response.data);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      message.error('Failed to transcribe audio.');
    } finally {
      setLoading(false); 
    }
  };

  const handleDownload = () => {
    if (transcription && transcription.results) {
      const transcriptText = transcription.results.channels[0].alternatives[0].paragraphs.transcript;

      const blob = new Blob([transcriptText], { type: 'text/plain' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'transcription.txt';

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    }
  };


  return (
    <div>
      <Card
        title="Audio Transcription"
        className={loading ? 'loading-card glassmorphism' : 'glassmorphism'}
        style={{ maxWidth: 700, margin: 'auto', marginTop: "80px" }}
      >
        <Upload beforeUpload={beforeUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />} style={{ marginBottom: '10px' }}>
            Select Audio File
          </Button>
        </Upload>
        <br />
        {audioFile && (
          <>
            <Text strong style={{ color: 'rgb(77 253 190)' }}>
              Selected Audio File :
            </Text>{' '}
            &nbsp;
            <Text strong style={{ color: 'rgb(255 187 126)' }}>
              {audioFile.name}
            </Text>
          </>
        )}
        <br />

        <Button type="primary" onClick={handleTranscribe} style={{ marginTop: '10px' }}>
          Transcribe
        </Button>

        {loading && <Spin style={{ margin: '20px 0' }} />} 

        {transcription && transcription.results && (
          <div style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '5px' }}>
            <Text strong style={{ color: '#ff9999' }}>Transcription:</Text>
            <div style={{ marginTop: '10px', wordWrap: 'break-word', color: '#ffd8d8' }}>
              {transcription.results.channels[0].alternatives[0].paragraphs.transcript}
            </div>
          </div>
        )}
        {transcription && transcription.results && (
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={{ marginTop: '10px' }}
            onClick={handleDownload}
          >
            Download Transcription
          </Button>
        )}
      </Card>
    </div>
  );
};

export default App;
