"use client";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(async (file: File) => {
    const dataUrl = await toDataUrl(file);
    setImage(dataUrl);
    sessionStorage.setItem("uploadedImage", dataUrl);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await handleFiles(f);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFiles(f);
  };

  const onSend = () => {
    if (!image) {
      alert("画像を選択してください。");
      return;
    }
    router.push("/upload");
  };

  const onDelete = () => {
    setImage(null);
    sessionStorage.removeItem("uploadedImage");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8">
      <h1 className="text-xl mb-6">顔をマスクする</h1>

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`drop-zone ${dragOver ? "drop-zone--over" : ""}`}
      >
        {image ? (
          <img src={image} alt="preview" className="max-h-40 object-contain" />
        ) : (
          <div className="text-gray-600">ここに画像をドラッグ・アンド・ドロップしてください。<br/>または下の「画像を選択」から</div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" id="file-input" />

      <div className="mt-6 flex gap-8">
        <label htmlFor="file-input" className="px-6 py-3 bg-blue-500 text-white rounded-lg cursor-pointer">画像を選択</label>
        <button onClick={onDelete} className="px-6 py-3 bg-blue-500 text-white rounded-lg">画像を削除</button>
        <button onClick={onSend} className="px-6 py-3 bg-blue-500 text-white rounded-lg">画像を送信</button>
      </div>
    </main>
  );
}
