import { NextResponse } from "next/server";
import sharp from "sharp"; // npm install sharp

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // Base64データ受け取り
    const API_KEY = process.env.AZURE_FACE_API_KEY;
    const ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT;

    if (!API_KEY || !ENDPOINT) {
      return NextResponse.json({ error: "APIキーまたはエンドポイントが設定されていません。" }, { status: 500 });
    }

    // Azure Face API に送信
    const response = await fetch(
      `${ENDPOINT}/face/v1.0/detect?returnFaceId=false&returnFaceLandmarks=false`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: Buffer.from(image.split(",")[1], "base64"),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Azure Face API エラー: ${errText}` }, { status: response.status });
    }

    const faces = await response.json();

    // 画像加工（簡易マスク）
    let imgBuffer = Buffer.from(image.split(",")[1], "base64");
    let sharpImg = sharp(imgBuffer);

    for (const face of faces) {
      const { left, top, width, height } = face.faceRectangle;
      sharpImg = sharpImg.composite([
        {
          input: {
            create: {
              width,
              height,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0.6 }, // 半透明マスク
            },
          },
          top,
          left,
        },
      ]);
    }

    const maskedBuffer = await sharpImg.png().toBuffer();
    const maskedBase64 = maskedBuffer.toString("base64");

    return NextResponse.json({ maskedImage: maskedBase64 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
