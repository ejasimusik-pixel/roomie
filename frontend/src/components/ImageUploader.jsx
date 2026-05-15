import { useCallback, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage, validateImageFile } from "../lib/storage";

/**
 * Drag & drop image uploader with instant preview and inline error/loading
 * states. Self-contained: triggers the actual Supabase Storage upload when a
 * file is dropped/selected, then calls `onUploaded({ url, path })`.
 *
 * Use `value` for the currently-saved image URL so the preview survives
 * remount/refresh. Pass `onClear` to detach the existing image.
 */
export default function ImageUploader({
  bucket,
  scopeId,
  value,
  onUploaded,
  onClear,
  label = "Imagen",
  aspect = "square", // 'square' | 'wide' | 'tall'
  testId,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  const aspectClass =
    aspect === "wide"
      ? "aspect-[16/9]"
      : aspect === "tall"
      ? "aspect-[3/4]"
      : "aspect-square";

  const previewSrc = localPreview || value;

  const handleFile = useCallback(
    async (file) => {
      setError(null);
      const v = validateImageFile(file);
      if (v) {
        setError(v);
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      setBusy(true);

      const { url, path, error: upErr } = await uploadImage({
        bucket,
        scopeId,
        file,
      });

      setBusy(false);
      if (upErr) {
        setError(upErr.message || "No pudimos subir tu imagen.");
        setLocalPreview(null);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      onUploaded?.({ url, path });
      // keep local preview but it'll match `value` once parent updates
    },
    [bucket, scopeId, onUploaded]
  );

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // allow re-selecting the same file
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setLocalPreview(null);
    setError(null);
    onClear?.();
  };

  return (
    <div data-testid={testId}>
      {label && <label className="rm-label">{label}</label>}

      {previewSrc ? (
        <div
          className={`relative ${aspectClass} w-full rounded-3xl overflow-hidden bg-white/60 border border-white/70 shadow-soft`}
        >
          <img
            src={previewSrc}
            alt="preview"
            className="w-full h-full object-cover"
          />
          {busy && (
            <div className="absolute inset-0 bg-violet-900/30 backdrop-blur-sm flex items-center justify-center text-white">
              <Loader2 className="animate-spin" size={26} />
            </div>
          )}
          {!busy && onClear && (
            <button
              type="button"
              onClick={clear}
              data-testid={testId ? `${testId}-clear` : undefined}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 text-violet-700 hover:bg-white shadow-soft"
              aria-label="Quitar imagen"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          data-testid={testId ? `${testId}-dropzone` : "image-uploader-dropzone"}
          className={`w-full ${aspectClass} rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 px-4 text-center cursor-pointer ${
            dragOver
              ? "border-magenta-500/60 bg-white/80"
              : "border-violet-200 bg-white/40 hover:bg-white/70"
          }`}
        >
          {busy ? (
            <Loader2 className="animate-spin text-violet-500" size={22} />
          ) : (
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-magenta-500/15 to-violet-500/15 text-violet-500">
              {dragOver ? <Upload size={20} /> : <ImageIcon size={20} />}
            </span>
          )}
          <p className="text-sm font-semibold text-violet-700">
            {busy ? "Subiendo…" : dragOver ? "Suelta para subir" : "Arrastra o toca para elegir"}
          </p>
          <p className="text-xs text-violet-400">PNG · JPG · WebP · máx. 5 MB</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onInputChange}
        data-testid={testId ? `${testId}-input` : undefined}
      />

      {error && (
        <p
          className="mt-2 text-xs text-magenta-600"
          data-testid={testId ? `${testId}-error` : undefined}
        >
          {error}
        </p>
      )}
    </div>
  );
}
