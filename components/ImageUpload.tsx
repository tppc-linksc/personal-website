"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  aspectRatio?: string;
  recommendedSize?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio = "1:1",
  recommendedSize = "400x400",
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("请上传图片文件");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("图片大小不能超过 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 800;
          let w = img.width;
          let h = img.height;
          if (w > MAX || h > MAX) {
            const ratio = Math.min(MAX / w, MAX / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setPreview(compressed);
          onChange(compressed);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

  return (
    <div className={className}>
      <div className="flex items-start gap-4">
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
            dragging
              ? "border-[var(--text-main)] bg-[var(--panel-soft)]"
              : "border-[var(--line-muted)] bg-[var(--panel-soft)] hover:border-[var(--text-muted)]"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="头像预览"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-[var(--text-soft)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="mt-1 text-xs text-[var(--text-soft)]">
                点击上传
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-main)]">
            上传头像
          </p>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            支持 JPG、PNG、WebP 格式
          </p>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            建议比例：<span className="font-medium">{aspectRatio}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            推荐尺寸：<span className="font-medium">{recommendedSize}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            文件大小：最大 2MB
          </p>

          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 text-xs text-red-500 transition hover:text-red-600"
            >
              移除图片
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
