"use client";

import { useState, useRef } from "react";

export default function InputModes({ onAddIngredients, onGenerateFromImage }) {
  const [mode, setMode] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Press the button and speak your ingredients…");
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const accumulatedRef = useRef("");

  const handleAddText = () => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/,|and/i).map((s) => s.trim()).filter(Boolean);
    onAddIngredients(parts);
    setTextValue("");
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImageBase64(e.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setTranscript("Speech recognition not supported. Please use Chrome.");
      return;
    }

    if (!isRecording) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      accumulatedRef.current = "";

      recognition.onresult = (e) => {
        let interim = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        accumulatedRef.current += final;
        setTranscript(accumulatedRef.current + interim || "Listening…");
      };

      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setTranscript("Listening…");
    } else {
      recognitionRef.current?.stop();
      setIsRecording(false);
      const text = accumulatedRef.current.trim();
      if (text) {
        const parts = text.split(/,|and/i).map((s) => s.trim()).filter(Boolean);
        onAddIngredients(parts);
        setTranscript("Ingredients added! Press button to record more.");
        accumulatedRef.current = "";
      }
    }
  };

  return (
    <div>
      <div className="section-title">Add More Ingredients</div>
      <div className="input-card">

        {/* Mode Tabs */}
        <div className="mode-tabs">
          {["text", "image", "voice"].map((m) => (
            <button
              key={m}
              className={`mode-btn ${mode === m ? "active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m === "text" ? "✏️ Text" : m === "image" ? "📷 Image" : "🎙️ Voice"}
            </button>
          ))}
        </div>

        {/* TEXT */}
        {mode === "text" && (
          <div className="text-input-row">
            <input
              className="text-input"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddText()}
              placeholder="e.g. garlic, onion, tomatoes…"
            />
            <button className="add-btn" onClick={handleAddText}>Add</button>
          </div>
        )}

        {/* IMAGE */}
        {mode === "image" && (
          <div>
            <div
              className={`upload-zone ${isDragging ? "drag" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="upload-icon">📸</div>
              <div className="upload-text">
                Click or drag & drop a photo of your ingredients
                <br />
                <span className="upload-accent">AI will identify them automatically</span>
              </div>
              {preview && (
                <img src={preview} alt="Preview" className="preview-img" />
              )}
            </div>
            {imageBase64 && (
              <button
                className="add-btn"
                style={{ marginTop: "10px", width: "100%" }}
                onClick={() => onGenerateFromImage(imageBase64, mediaType)}
              >
                🔍 Analyze Image & Generate Recipes
              </button>
            )}
          </div>
        )}

        {/* VOICE */}
        {mode === "voice" && (
          <div>
            <button
              className={`voice-btn ${isRecording ? "recording" : ""}`}
              onClick={toggleVoice}
            >
              <span>{isRecording ? "⏹️" : "🎙️"}</span>
              <span>{isRecording ? "Stop Recording" : "Start Voice Input"}</span>
            </button>
            <div className="voice-transcript">{transcript}</div>
          </div>
        )}

      </div>
    </div>
  );
}