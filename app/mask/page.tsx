"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MaskPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [maskedImage, setMaskedImage] = useState<string | null>(null);

  useEffect(() => {
    const imgData = searchParams.get("img");
    if (imgData) {
      setMaskedImage(`data:image/png;base64,${imgData}`);
    } else {
      // クエリがない場合はアップロード画面へ戻す
      router.push("/upload");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">マスク処理結果</h1>

      {maskedImage ? (
        <img
          src={maskedImage}
          alt="Masked Result"
          className="w-80 h-80 object-contain border border-gray-300 rounded shadow"
        />
      ) : (
        <p className="text-gray-600">画像を読み込み中です...</p>
      )}

      <button
        onClick={() => router.push("/upload")}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        もう一度アップロードする
      </button>
    </div>
  );
}
