export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl } = req.body;

  try {
    const response = await fetch(
      `${process.env.AZURE_FACE_API_ENDPOINT}/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_FACE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error calling Face API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
