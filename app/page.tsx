"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [maskedImage, setMaskedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMask = async () => {
    if (!image) return alert("先に画像を選択してください。");
    setLoading(true);

    try {
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

  const handleReset = () => {
    setImage(null);
    setMaskedImage(null);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {!maskedImage ? (
        <>
          <h1 className="text-lg font-medium mb-6">顔をマスクする</h1>

          {/* ドロップエリア */}
          <div className="border border-gray-400 rounded-2xl p-10 text-center w-[500px] min-h-[200px] flex flex-col items-center justify-center">
            {!image ? (
              <>
                <p className="text-gray-600 mb-4">
                  ここに画像をドラッグ・アンド・ドロップしてください。
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-blue-600 underline"
                >
                  画像を選択
                </label>
              </>
            ) : (
              <img
                src={image}
                alt="original"
                className="max-w-[200px] max-h-[200px] rounded-lg"
              />
            )}
          </div>

          {/* ボタンエリア */}
          <div className="flex gap-8 mt-8">
            <button
              onClick={handleReset}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              画像を削除
            </button>

            <button
              onClick={handleMask}
              disabled={!image || loading}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "マスク中..." : "画像をマスク"}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* マスク後の表示 */}
          <img
            src={maskedImage}
            alt="masked"
            className="max-w-[250px] max-h-[250px] rounded-lg mb-8"
          />
          <button
            onClick={handleReset}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600"
          >
            戻る
          </button>
        </>
      )}
    </main>
  );
}
