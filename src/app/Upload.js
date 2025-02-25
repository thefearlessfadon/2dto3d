"use client";
import { useState } from "react";

export default function Upload({ onFileUpload }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      style={{
        border: "2px dashed #aaa",
        borderRadius: "10px",
        padding: "30px",
        textAlign: "center",
        backgroundColor: dragActive ? "#f0f0f0" : "white",
        transition: "0.2s",
      }}
    >
      <p>2D planı buraya sürükleyin veya yükleyin</p>
      <input type="file" onChange={handleChange} />
    </div>
  );
}
