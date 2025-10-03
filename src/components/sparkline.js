// src/components/sparkline.js
export function renderSparkline(canvas, data) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height - ((data[0] - min) / range) * canvas.height);

  data.forEach((point, i) => {
    const x = (i / (data.length - 1)) * canvas.width;
    const y = canvas.height - ((point - min) / range) * canvas.height;
    ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#4cafef";
  ctx.lineWidth = 2;
  ctx.stroke();
}