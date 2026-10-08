"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

/** Add photos by URL or upload; reorder (first = cover) and remove. */
export function PhotoManager({ urls, onChange }: { urls: string[]; onChange: (urls: string[]) => void }) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\/\S+$/i.test(u)) {
      toast.error("Enter a full image URL starting with http:// or https://");
      return;
    }
    if (urls.includes(u)) return toast.error("That photo is already added");
    onChange([...urls, u]);
    setUrl("");
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        added.push((await api.uploadImage(f)).url);
      } catch (e) {
        toast.error(`${f.name}: ${(e as Error).message}`);
      }
    }
    onChange([...urls, ...added]);
    setUploading(false);
    if (file.current) file.current.value = "";
  };

  const move = (i: number, d: number) => {
    const next = [...urls];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          placeholder="Paste an image URL" className="field flex-1" aria-label="Image URL" />
        <button type="button" onClick={addUrl} className="btn-dark">Add</button>
        <button type="button" onClick={() => file.current?.click()} disabled={uploading} className="btn-outline flex items-center justify-center gap-2">
          {uploading ? <Spinner /> : <><Icon name="upload" size={16} /> Upload</>}
        </button>
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>

      {urls.length === 0 ? (
        <button type="button" onClick={() => file.current?.click()} className="mt-6 flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted bg-soft">
          <Icon name="image" size={48} strokeWidth={1.2} />
          <span className="text-lg font-semibold">Add at least one photo</span>
          <span className="text-sm text-muted">JPG, PNG or WebP up to 5 MB, or paste a link above</span>
        </button>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {urls.map((u, i) => (
            <li key={u} className={`group relative overflow-hidden rounded-xl bg-soft ${i === 0 ? "col-span-2 md:col-span-3" : ""}`}>
              <Img src={u} alt={`Photo ${i + 1}`} className={`w-full object-cover ${i === 0 ? "aspect-[16/9]" : "aspect-square"}`} />
              {i === 0 && <span className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-[#222] shadow-pill">Cover photo</span>}
              <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                {i > 0 && <button type="button" onClick={() => move(i, -1)} aria-label="Move earlier" className="rounded-full bg-white p-2 text-[#222] shadow-pill"><Icon name="chevron-left" size={12} strokeWidth={3} /></button>}
                {i < urls.length - 1 && <button type="button" onClick={() => move(i, 1)} aria-label="Move later" className="rounded-full bg-white p-2 text-[#222] shadow-pill"><Icon name="chevron-right" size={12} strokeWidth={3} /></button>}
                <button type="button" onClick={() => onChange(urls.filter((x) => x !== u))} aria-label="Remove photo" className="rounded-full bg-white p-2 text-[#222] shadow-pill"><Icon name="trash" size={12} strokeWidth={2.5} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-muted">Tip: 5 or more photos help guests picture their stay. Use the arrows to choose the cover.</p>
    </div>
  );
}
