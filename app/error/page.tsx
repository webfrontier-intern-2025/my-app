"use client";
import { useSearchParams, useRouter } from "next/navigation";

export default function ErrorPage() {
  const params = useSearchParams();
  const router = useRouter();
  const msg = params.get("msg") || "不明なエラーが発生しました。";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-xl text-red-500 mb-4">エラー</h1>
      <p>{msg}</p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-xl"
      >
        ホームへ戻る
      </button>
    </main>
  );
}
