"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const url = sessionStorage.getItem("uploadedImage");
    if (!url) router.push("/");
    setImageUrl(url);
  }, [router]);

  const handleDelete = () => {
    sessionStorage.removeItem("uploadedImage");
    sessionStorage.removeItem("maskedImage");
    router.push("/");
  };

  const handleMask = async () => {
    if (!imageUrl) return;

    // APIへ送信
    const res = await fetch("/api/mask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageUrl }),
    });

    const data = await res.json();
    if (data.error) {
      alert("APIエラー: " + data.error);
      return;
    }

    const faces = data.faces || [];
    if (faces.length === 0) {
      alert("顔が検出されませんでした。");
      return;
    }

    // Canvasでマスク描画
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      faces.forEach((f: any) => {
        const { left, top, width, height } = f.faceRectangle;
        ctx.fillRect(left, top, width, height); // 顔領域を黒く塗る
      });

      const masked = canvas.toDataURL("image/png");
      sessionStorage.setItem("maskedImage", masked);
      router.push("/mask");
    };
    img.src = imageUrl;
  };

  if (!imageUrl) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8">
      <h1 className="text-xl mb-6">アップロード画像</h1>

      <div className="w-[520px] h-[220px] rounded-2xl border p-4 flex items-center justify-center">
        <img src={imageUrl} alt="uploaded" className="max-h-full object-contain" />
      </div>

      <div className="mt-6 flex gap-8">
        <button onClick={handleDelete} className="px-6 py-3 bg-blue-500 text-white rounded-lg">画像を削除</button>
        <button onClick={handleMask} className="px-6 py-3 bg-blue-500 text-white rounded-lg">画像をマスク</button>
      </div>
    </main>
  );
}
