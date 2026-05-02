"use client";

import { useState, useRef } from "react";

// Compress image before sending to API
function compressImage(file, maxWidth = 1024, quality = 0.85) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Get compressed base64
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve({
        base64: compressed.split(",")[1],
        mediaType: "image/jpeg",
        dataUrl: compressed,
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

export default function InputModes({ onAddIngredients, onGenerateFromImage }) {
  const [mode, setMode] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageData, setImageData] = useState(null); // { base64, mediaType }
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Press the button and speak your ingredients…");
  const [compressing, setCompressing] = useState(false);
  const [imageInfo, setImageInfo] = useState(null); // size info
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

  const handleFile = async (file) => {
    if (!file) return;

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a JPEG, PNG, WEBP or GIF image.");
      return;
    }

    // Validate size before compression (max 20MB raw)
    if (file.size > 20 * 1024 * 1024) {
      alert("Image is too large. Please use an image under 20MB.");
      return;
    }

    setCompressing(true);
    setImageInfo(null);

    try {
      const { base64, mediaType, dataUrl } = await compressImage(file);

      const compressedSize = Math.round((base64.length * 3) / 4 / 1024);
      setImageInfo({
        name: file.name,
        originalSize: Math.round(file.size / 1024),
        compressedSize,
      });

      setPreview(dataUrl);
      setImageData({ base64, mediaType });
    } catch (err) {
      alert("Failed to process image. Please try another.");
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setPreview(null);
    setImageData(null);
    setImageInfo(null);
    if (fileRef.current) fileRef.current.value = "";
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

        {/* TEXT MODE */}
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

        {/* IMAGE MODE */}
        {mode === "image" && (
          <div>
            {/* Drop Zone */}
            {!preview && (
              <div
                className={`upload-zone ${isDragging ? "drag" : ""} ${compressing ? "compressing" : ""}`}
                onClick={() => !compressing && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {compressing ? (
                  <>
                    <div className="upload-icon">⚙️</div>
                    <div className="upload-text">Compressing image…</div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">📸</div>
                    <div className="upload-text">
                      Click or drag & drop a photo of your ingredients
                      <br />
                      <span className="upload-accent">AI will identify them automatically</span>
                      <br />
                      <span style={{ fontSize: "11px", opacity: 0.6 }}>
                        JPEG, PNG, WEBP, GIF · Max 20MB
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="image-preview-wrap">
                <img src={preview} alt="Ingredient preview" className="preview-img" />

                {/* Image Info */}
                {imageInfo && (
                  <div className="image-info">
                    <span>📁 {imageInfo.name}</span>
                    <span>
                      {imageInfo.originalSize}KB → {imageInfo.compressedSize}KB
                      {imageInfo.compressedSize < imageInfo.originalSize && (
                        <span className="compressed-badge">compressed</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="image-actions">
                  <button
                    className="add-btn"
                    onClick={() => onGenerateFromImage(imageData.base64, imageData.mediaType)}
                  >
                    🔍 Analyze & Generate Recipes
                  </button>
                  <button className="clear-image-btn" onClick={clearImage}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="image-tips">
              <p>💡 <strong>Tips for best results:</strong></p>
              <ul>
                <li>Good lighting helps Claude identify ingredients accurately</li>
                <li>Lay ingredients flat and spread them out</li>
                <li>Include packaging labels if helpful</li>
                <li>Fridge/pantry shelf photos work great too</li>
              </ul>
            </div>
          </div>
        )}

        {/* VOICE MODE */}
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