"use client";

import { useState, useRef } from "react";
import MaterialIcon from "./MaterialIcon";

interface ExploreUploadProps {
  companyId: string;
  companyName: string;
}

export default function ExploreUpload({ companyId, companyName }: ExploreUploadProps) {
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        setMessage("Failed to upload file");
        return;
      }
      const { url } = await uploadRes.json();

      const isVideo = file.type.startsWith("video/");

      const postRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: url,
          mediaType: isVideo ? "video" : "image",
          caption: caption || null,
          companyId,
        }),
      });

      if (postRes.ok) {
        setCaption("");
        setMessage("Posted successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const err = await postRes.json();
        setMessage(err.error || "Failed to post");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-primary/20 p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <MaterialIcon icon="add_photo_alternate" className="text-primary text-xl" />
        <div>
          <p className="text-sm font-bold">Share Content</p>
          <p className="text-[10px] text-slate-500">Posting as <span className="text-primary font-bold">{companyName}</span></p>
        </div>
      </div>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3"
        placeholder="Caption (optional)"
        dir="auto"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.accept = "image/*";
              fileRef.current.click();
            }
          }}
          disabled={uploading}
          className="flex-1 bg-primary text-slate-900 text-sm font-bold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <MaterialIcon icon="photo_camera" className="text-base" />
          {uploading ? "Uploading..." : "Photo"}
        </button>
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.accept = "video/*";
              fileRef.current.click();
            }
          }}
          disabled={uploading}
          className="flex-1 bg-primary/10 text-primary text-sm font-bold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 border border-primary/20"
        >
          <MaterialIcon icon="videocam" className="text-base" />
          {uploading ? "Uploading..." : "Video"}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 font-medium ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
