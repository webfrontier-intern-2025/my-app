import { NextResponse } from "next/server";

export async function POST() {
  const API_KEY = process.env.FACE_API_TOKEN;
  if (!API_KEY) {
    return NextResponse.json({ error: "APIキーが設定されていません。" }, { status: 500 });
  }

  // ここで顔検知API呼び出し
  // const res = await fetch("https://api.example.com/mask", { headers: { Authorization: `Bearer ${API_KEY}` } });

  return NextResponse.json({ message: "マスク処理成功" });
}
