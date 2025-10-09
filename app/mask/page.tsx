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

  const handleMask = async () => {
    try {
      const res = await fetch("/api/mask", { method: "POST" });
      if (!res.ok) throw new Error("APIエラー");
      router.push("/mask");
    } catch (err) {
      router.push("/error?msg=マスク処理に失敗しました。");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-lg mb-4">顔をマスクする</h1>
      {imageUrl && <img src={imageUrl} className="w-48 h-48 object-contain" />}
      <div className="flex mt-6 space-x-6">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow"
        >
          画像を削除
        </button>
        <button
          onClick={handleMask}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow"
        >
          画像をマスク
        </button>
      </div>
    </main>
  );
}
