import React, { useMemo, useState } from "react";
import background from "./header.jpeg";
import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";
import ImageModal from "./ImageModal";
import Resizer from "react-image-file-resizer";

const resizeFile = (file) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      300,
      300,
      "JPEG",
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });

const App = React.memo(() => {

  const [image, setImage] = useState();
  const [imageFile, setImageFile] = useState();
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [answer, setAnswer] = useState();
  const [listening, setListening] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const startButton = document.getElementById("start")
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
    continuous: true
  });

  function reset() {
    setImage(undefined);
    setImageFile(undefined);
    setAnswer("");
    setResponse("");
    resetTranscript();
  }

  async function sendRequest() {
    const formData = new FormData();
    setLoading(true);
    formData.append("file", imageFile);
    formData.append("question", transcript + "?");
    
    try {
      const res = await fetch('https://vqa-backend.victoriousocean-5c59fa05.eastus.azurecontainerapps.io/predict', {
        method: "POST",
        body: formData
      }).then(response => {
        return response.json();
      });
      
      setLoading(false);
      console.log('Backend response:', res);
      
      // Extract the top answer from the predictions array
      let ans = res.predicted_answers && res.predicted_answers.length > 0 
        ? res.predicted_answers[0].class_name 
        : 'No answer found';
      
      setResponse(res);
      setAnswer(ans);
    } catch (error) {
      console.error('Error sending request:', error);
      setLoading(false);
      setResponse(null);
      setAnswer('Error processing request');
    }
  }

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h4>Browser Not Supported</h4>
          <p>Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.</p>
          <p>Speech recognition requires HTTPS in production (http://localhost is OK for development).</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxHeight: '350px' }}>
        <img src={background} />
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col">
            <h2>Ahmed Nada VQA Project - University Of Washington Bothell</h2>
            <h3>Click below to upload a picture or use your camera to snap a picture</h3>
            <ImageModal setImage={setImage} setImageFile={setImageFile} />
            {image && (
              <img style={{ width: 600, height: 600 }} src={image} />
            )}
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col">
            <h3>Click start on the audio button to start recording your question, when done click stop</h3>
            {!imageFile && <p className="text-warning">⚠️ Please upload an image first before recording</p>}
            {!browserSupportsSpeechRecognition && <p className="text-danger">❌ Speech recognition not supported in this browser</p>}
            <button 
              disabled={!imageFile} 
              id="start" 
              onClick={() => {
                console.log('Start button clicked');
                SpeechRecognition.startListening();
                setListening(true);
              }} 
              className="btn btn-primary"
            >
              {listening ? '🎤 Recording...' : 'Start'}
            </button>
            <button 
              onClick={() => {
                SpeechRecognition.stopListening();
                setListening(false);
              }} 
              className="btn btn-danger" 
              style={{ marginLeft: '5px' }}
            >
              Stop
            </button>
            <button onClick={resetTranscript} className="btn btn-danger" style={{ marginLeft: '5px' }}>Reset</button>
             <p><strong>Your question:</strong> {transcript ? transcript + "?" : "(no question recorded yet)"}</p>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col">
            <h3>Finally</h3>
            <button disabled={!imageFile || !transcript} onClick={sendRequest} className="btn btn-success">Send request</button>
            <button onClick={reset} className="btn btn-danger" style={{ marginLeft: '5px' }}>Reset</button>
          </div>
        </div>
        {response && (
          <>
            <div className="row justify-content-center mt-4">
              <div className="col-md-8">
                <div className="card shadow-lg">
                  <div className="card-header bg-success text-white">
                    <h4 className="mb-0">🎯 Top Answer</h4>
                  </div>
                  <div className="card-body text-center">
                    <h2 className="display-4 text-success">{answer}</h2>
                    <p className="text-muted">Most confident prediction</p>
                    {response.predicted_answers && response.predicted_answers[0] && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Confidence: {response.predicted_answers[0].confidence} | 
                          Probability: {(response.predicted_answers[0].probability * 100).toFixed(2)}%
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row justify-content-center mt-4">
              <div className="col-md-8">
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">📊 All Predictions ({response.predicted_answers ? response.predicted_answers.length : 0} answers)</h5>
                  </div>
                  <div className="card-body">
                    <button 
                      className="btn btn-outline-primary w-100" 
                      onClick={() => setShowAllAnswers(!showAllAnswers)}
                    >
                      {showAllAnswers ? '▲ Hide all answers' : '▼ Click to view all possible answers'}
                    </button>
                    
                    {showAllAnswers && response.predicted_answers && (
                      <div className="mt-3">
                        <div className="list-group">
                          {response.predicted_answers.map((prediction, index) => (
                            <div 
                              key={index} 
                              className={`list-group-item ${
                                index === 0 ? 'list-group-item-success' : ''
                              }`}
                            >
                              <div className="d-flex w-100 justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  {index === 0 && '🥇 '}
                                  {index === 1 && '🥈 '}
                                  {index === 2 && '🥉 '}
                                  <strong>{prediction.class_name}</strong>
                                </h6>
                                <span className="badge bg-primary rounded-pill">Rank #{prediction.rank}</span>
                              </div>
                              <small className="text-muted">
                                Class ID: {prediction.class_id} | 
                                Probability: {(prediction.probability * 100).toFixed(2)}% | 
                                Confidence: {prediction.confidence}
                              </small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
});
export default App;
