const videoUploader = document.getElementById('videoUploader');
const video = document.getElementById('video');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const makeGifButton = document.getElementById('makeGif');
const gifResult = document.getElementById('gifResult');
const downloadLink = document.getElementById('downloadLink');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let gif;

videoUploader.addEventListener('change', () => {
  const file = videoUploader.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
    video.onloadedmetadata = () => {
      endTimeInput.value = Math.min(5, Math.floor(video.duration));
      startTimeInput.max = Math.floor(video.duration);
      endTimeInput.max = Math.floor(video.duration);
    };
  }
});

makeGifButton.addEventListener('click', () => {
  const start = parseFloat(startTimeInput.value);
  const end = parseFloat(endTimeInput.value);
  if (isNaN(start) || isNaN(end) || start >= end) {
    alert('Please enter valid start and end times with start < end.');
    return;
  }
  if (!video.src) {
    alert('Please upload a video file first.');
    return;
  }

  makeGifButton.disabled = true;
  makeGifButton.textContent = 'Creating GIF...';

  gif = new GIF({
    workers: 2,
    quality: 10,
    width: 320,
    height: 180,
    workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
  });

  canvas.width = 320;
  canvas.height = 180;

  video.currentTime = start;

  const fps = 10;
  const frameDuration = 1 / fps;
  let currentTime = start;

  video.pause();

  function captureFrame() {
    if (currentTime > end || currentTime > video.duration) {
      gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        gifResult.src = url;
        downloadLink.href = url;
        downloadLink.download = 'output.gif';
        downloadLink.style.display = 'inline';
        downloadLink.textContent = 'Download GIF';
        makeGifButton.disabled = false;
        makeGifButton.textContent = 'Create GIF';
      });
      gif.render();
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    gif.addFrame(ctx, {copy: true, delay: 100});
    currentTime += frameDuration;
    video.currentTime = currentTime;
  }

  video.addEventListener('seeked', captureFrame, { once: false });

  video.addEventListener('seeked', function handler() {
    captureFrame();
    if (currentTime > end || currentTime > video.duration) {
      video.removeEventListener('seeked', handler);
    }
  });

  video.currentTime = start;
});
