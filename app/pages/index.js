async function detectFace(imageUrl) {
  const res = await fetch('/api/face-detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  const data = await res.json();
  console.log(data);
}
