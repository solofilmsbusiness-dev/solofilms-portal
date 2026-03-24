"use client";

import { motion } from "framer-motion";
import { Download, FileVideo, FileImage, File, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeliverableCardProps {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  version: number;
  isFinal: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("video/")) return FileVideo;
  if (fileType.startsWith("image/")) return FileImage;
  return File;
}

export function DeliverableCard({
  id,
  fileName,
  fileType,
  fileSize,
  version,
  isFinal,
}: DeliverableCardProps) {
  const [downloading, setDownloading] = useState(false);
  const Icon = getFileIcon(fileType);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/deliverables/${id}/download`);
      if (!res.ok) throw new Error("Could not generate download link");
      const { url, fileName: name } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = name ?? fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-cinema-border glass p-4 transition-all hover:border-gold/30"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Inner glow on hover */}
      <div className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gold/10 opacity-0 blur-[30px] transition-opacity duration-300 group-hover:opacity-100" />

      {/* File icon */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cinema-muted/30">
        <Icon className="h-6 w-6 text-cinema-subtle" />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cinema-text">
          {fileName}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-cinema-subtle">
          {fileSize > 0 && <span>{formatFileSize(fileSize)}</span>}
          <span className="rounded-full bg-cinema-muted/30 px-1.5 py-0.5">v{version}</span>
          {isFinal && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" /> Final
            </span>
          )}
        </div>
      </div>

      {/* Download button */}
      <motion.button
        onClick={handleDownload}
        disabled={downloading}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cinema-border bg-cinema-muted/20 text-cinema-subtle transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-gold disabled:opacity-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {downloading ? (
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-gold border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </motion.button>
    </motion.div>
  );
}
