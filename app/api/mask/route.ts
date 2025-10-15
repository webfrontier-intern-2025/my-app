// app/api/mask/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image: string | undefined = body?.image;

    if (!image) {
      return NextResponse.json(
        { error: "画像データが見つかりません（image が空です）" },
        { status: 400 }
      );
    }

    // 環境変数を取得
    const API_KEY =
      process.env.AZURE_FACE_API_KEY || process.env.MASK_API_KEY;
    const ENDPOINT =
      process.env.AZURE_FACE_API_ENDPOINT || process.env.MASK_API_ENDPOINT;

    if (!API_KEY || !ENDPOINT) {
      console.error("Missing env:", {
        AZURE_FACE_API_KEY: !!process.env.AZURE_FACE_API_KEY,
        AZURE_FACE_API_ENDPOINT: !!process.env.AZURE_FACE_API_ENDPOINT,
        MASK_API_KEY: !!process.env.MASK_API_KEY,
        MASK_API_ENDPOINT: !!process.env.MASK_API_ENDPOINT,
      });
      return NextResponse.json(
        {
          error:
            "サーバ設定エラー：APIキーまたはエンドポイントが設定されていません。",
        },
        { status: 500 }
      );
    }

    // base64を抽出
    const base64 = image.includes(",") ? image.split(",")[1] : image;

    if (!base64 || base64.length === 0) {
      return NextResponse.json(
        { error: "base64 データが空です" },
        { status: 400 }
      );
    }

    // Azure Face API URL
    const endpointClean = ENDPOINT.replace(/\/+$/, "");
    const detectUrl = `${endpointClean}/face/v1.0/detect?returnFaceId=false&returnFaceLandmarks=false&detectionModel=detection_03`;

    // 顔検出
    const detectResp = await fetch(detectUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: Buffer.from(base64, "base64"),
    });

    if (!detectResp.ok) {
      const txt = await detectResp.text().catch(() => "");
      console.error("Face API error:", detectResp.status, txt);
      return NextResponse.json(
        { error: `Face API エラー: ${detectResp.status} ${txt}` },
        { status: detectResp.status }
      );
    }

    const faces = await detectResp.json();

    if (!faces || faces.length === 0) {
      return NextResponse.json(
        { error: "人物が検出されませんでした。人物画像をアップロードしてください。" },
        { status: 400 }
      );
    }

    // マスク処理（黒塗り→ニコちゃん画像）
    const imgBuffer = Buffer.from(base64, "base64");
    let img = sharp(imgBuffer).png();

    // ① ニコちゃん画像の絶対パスを取得
    const smilePath = path.join(process.cwd(), "public", "smile_mask.png");

    // ② ファイル存在チェック
    if (!fs.existsSync(smilePath)) {
      return NextResponse.json(
        { error: "ニコちゃんマーク画像（smile_mask.png）が見つかりません。" },
        { status: 500 }
      );
    }

    // ③ ニコちゃん画像を読み込み
    const smileBuffer = fs.readFileSync(smilePath);

    // ④ 顔位置に応じてリサイズ＆合成
    const composites: { input: Buffer; top: number; left: number }[] = [];

    for (const face of faces) {
      const rect = face.faceRectangle || face.face?.rectangle;
  if (!rect) continue;

  // === サイズを大きめに（顔全体をしっかり覆う） ===
  const scale = 1.5; // ← 拡大率（大きいほど広く覆う）
  const width = Math.max(1, Math.floor(rect.width * scale));
  const height = Math.max(1, Math.floor(rect.height * scale));

  // === 顔の中心を保つように位置調整 ===
  const left = Math.max(0, Math.floor(rect.left - (width - rect.width) / 2));
  const top = Math.max(0, Math.floor(rect.top - (height - rect.height) / 2));

  // === ニコちゃん画像をリサイズして合成 ===
  const resizedSmile = await sharp(smileBuffer)
    .resize(width, height, { fit: "cover" })
    .toBuffer();

  composites.push({
    input: resizedSmile,
    top,
    left,
  });
    }

    if (composites.length > 0) {
      img = img.composite(composites);
    }

    const maskedBuffer = await img.png().toBuffer();
    const maskedBase64 = maskedBuffer.toString("base64");

    return NextResponse.json({ maskedImage: maskedBase64 });
  } catch (err: any) {
    console.error("マスク処理中のエラー:", err);
    return NextResponse.json(
      { error: "マスク処理中に予期せぬエラーが発生しました。" },
      { status: 500 }
    );
  }
}
