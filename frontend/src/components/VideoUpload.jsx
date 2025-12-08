import { useState } from "react";

export default function VideoUpload({ onVideoSelect }) {
  const [videoUrl, setVideoUrl] = useState("");

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    if (onVideoSelect) {
      onVideoSelect(url, file);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full">
      <h2 className="text-xl font-semibold mb-3">Upload Your Presentation Video</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="border p-2 rounded w-full"
      />

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          className="mt-4 w-full rounded-lg border"
        />
      )}
    </div>
  );
}
