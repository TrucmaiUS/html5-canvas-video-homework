const video = document.getElementById("sourceVideo");
const edgeCanvas = document.getElementById("edgeCanvas");
const playbackStatus = document.getElementById("playbackStatus");

const edgeContext = edgeCanvas.getContext("2d");
const frameBuffer = document.createElement("canvas");
const bufferContext = frameBuffer.getContext("2d", { willReadFrequently: true });

let animationFrameId = 0;
let width = edgeCanvas.width;
let height = Math.round((width * 9) / 16);

frameBuffer.width = width;
frameBuffer.height = height;
edgeCanvas.height = height;

drawPlaceholder(edgeContext, "Canvas", "Edge detection output will update while the video plays");

video.addEventListener("loadedmetadata", () => {
  syncCanvasSize();
});

window.addEventListener("resize", () => {
  updateDisplayWidth();
});

video.addEventListener("loadeddata", () => {
  updateStatus("Video loaded. Press Play to start the demo");
  renderCurrentFrame();
});

video.addEventListener("play", () => {
  cancelAnimationFrame(animationFrameId);
  updateStatus("Video is playing and edge detection is updating frame by frame");
  renderLoop();
});

video.addEventListener("pause", () => {
  cancelAnimationFrame(animationFrameId);
  updateStatus("Video paused. The canvas keeps the last rendered result");
  renderCurrentFrame();
});

video.addEventListener("ended", () => {
  cancelAnimationFrame(animationFrameId);
  updateStatus("Video finished. The canvas is showing the last detected result");
  renderCurrentFrame();
});

video.addEventListener("seeked", () => {
  if (!video.paused) {
    renderCurrentFrame();
    return;
  }

  updateStatus("Video seek completed. The canvas is synced to the current frame");
  renderCurrentFrame();
});

function renderLoop() {
  renderCurrentFrame();

  if (!video.paused && !video.ended) {
    animationFrameId = requestAnimationFrame(renderLoop);
  }
}

function renderCurrentFrame() {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return;
  }

  bufferContext.drawImage(video, 0, 0, width, height);

  const frame = bufferContext.getImageData(0, 0, width, height);
  const edgeImage = detectEdges(frame);
  edgeContext.putImageData(edgeImage, 0, 0);
}

function syncCanvasSize() {
  const sourceWidth = video.videoWidth || video.width || 640;
  const sourceHeight = video.videoHeight || Math.round((sourceWidth * 9) / 16);

  width = sourceWidth;
  height = sourceHeight;

  frameBuffer.width = width;
  frameBuffer.height = height;
  edgeCanvas.width = width;
  edgeCanvas.height = height;

  updateDisplayWidth();
}

function updateDisplayWidth() {
  const displayWidth = video.clientWidth || video.width || width || 640;
  document.documentElement.style.setProperty("--video-frame-width", `${displayWidth}px`);
}

function detectEdges(imageData) {
  const source = imageData.data;
  const grayscale = new Uint8ClampedArray(width * height);
  const output = new Uint8ClampedArray(source.length);

  for (let index = 0; index < grayscale.length; index += 1) {
    const offset = index * 4;
    grayscale[index] =
      source[offset] * 0.299 +
      source[offset + 1] * 0.587 +
      source[offset + 2] * 0.114;
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;

      const gx =
        -grayscale[index - width - 1] -
        2 * grayscale[index - 1] -
        grayscale[index + width - 1] +
        grayscale[index - width + 1] +
        2 * grayscale[index + 1] +
        grayscale[index + width + 1];

      const gy =
        -grayscale[index - width - 1] -
        2 * grayscale[index - width] -
        grayscale[index - width + 1] +
        grayscale[index + width - 1] +
        2 * grayscale[index + width] +
        grayscale[index + width + 1];

      const magnitude = Math.min(255, Math.hypot(gx, gy));
      const offset = index * 4;

      output[offset] = magnitude;
      output[offset + 1] = Math.min(255, magnitude * 0.92);
      output[offset + 2] = Math.min(255, magnitude * 0.82 + 24);
      output[offset + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}

function drawPlaceholder(context, title, description) {
  context.clearRect(0, 0, width, height);

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#16222d");
  background.addColorStop(1, "#243746");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  context.lineWidth = 2;
  context.strokeRect(18, 18, width - 36, height - 36);

  context.fillStyle = "#ffffff";
  context.font = "700 30px Segoe UI";
  context.fillText(title, 40, 70);

  context.fillStyle = "rgba(255, 255, 255, 0.76)";
  context.font = "20px Segoe UI";
  wrapText(context, description, 40, 120, width - 80, 28);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
      continue;
    }

    line = nextLine;
  }

  if (line) {
    context.fillText(line, x, lineY);
  }
}

function updateStatus(message) {
  playbackStatus.textContent = message;
}
