"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [maskedImage, setMaskedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 画像選択またはドロップ時
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // マスクボタン押下時
  const handleMask = async () => {
    if (!image) return alert("先に画像を選択してください。");
    setLoading(true);

    try {
      // Base64のヘッダーを除去して送信
      const base64Data = image.split(",")[1];

      const res = await fetch("/api/mask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!res.ok) throw new Error("マスク処理に失敗しました。");

      const data = await res.json();
      setMaskedImage(`data:image/png;base64,${data.maskedImage}`);
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました。コンソールを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      <h1 className="text-2xl font-bold">画像マスク処理デモ</h1>

      {/* アップロードフォーム */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* 元画像プレビュー */}
      {image && (
        <div className="mt-4">
          <p className="font-semibold text-gray-700 mb-1">元画像:</p>
          <img src={image} alt="original" className="max-w-xs rounded-lg shadow" />
        </div>
      )}

      {/* マスクボタン */}
      {image && (
        <button
          onClick={handleMask}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "マスク処理中..." : "マスク"}
        </button>
      )}

      {/* 結果画像 */}
      {maskedImage && (
        <div className="mt-6">
          <p className="font-semibold text-gray-700 mb-1">マスク後の画像:</p>
          <img src={maskedImage} alt="masked" className="max-w-xs rounded-lg shadow" />
        </div>
      )}
    </main>
  );
}