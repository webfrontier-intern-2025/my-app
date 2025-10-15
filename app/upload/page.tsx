"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) {
      setErrorMessage("画像を選択してください。");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/mask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();

      if (!res.ok) {
        // サーバー側からのエラーメッセージを表示
        setErrorMessage(data.error || "アップロードに失敗しました。");
      } else {
        // 結果ページへ遷移（Base64をクエリに渡す or 状態共有）
        router.push(`/mask?img=${encodeURIComponent(data.maskedImage)}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">画像アップロード</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4"
      />

      {image && (
        <img
          src={image}
          alt="preview"
          className="w-64 h-64 object-cover mb-4 rounded shadow"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "処理中..." : "アップロードしてマスク処理"}
      </button>

      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <p className="text-red-600 font-medium mt-4 text-center whitespace-pre-line">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
