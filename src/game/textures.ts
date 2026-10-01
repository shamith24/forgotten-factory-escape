import * as THREE from "three";

function make(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, repeat = 1) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function noise(c: CanvasRenderingContext2D, s: number, n: number, alpha: number) {
  for (let i = 0; i < n; i++) {
    const v = Math.random() * 255;
    c.fillStyle = `rgba(${v},${v * 0.9},${v * 0.8},${alpha})`;
    c.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}

export const floorTex = () =>
  make(512, (c, s) => {
    c.fillStyle = "#3a332b";
    c.fillRect(0, 0, s, s);
    const t = s / 4;
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++) {
        const v = 40 + Math.random() * 20;
        c.fillStyle = (x + y) % 2 ? `rgb(${v + 20},${v + 12},${v})` : `rgb(${v},${v - 4},${v - 10})`;
        c.fillRect(x * t + 1, y * t + 1, t - 2, t - 2);
      }
    noise(c, s, 6000, 0.15);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = `rgba(20,10,5,${0.2 + Math.random() * 0.3})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 10 + Math.random() * 50, 6 + Math.random() * 30, Math.random() * 3, 0, 7);
      c.fill();
    }
  }, 6);

export const wallTex = () =>
  make(512, (c, s) => {
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "#4b4a3a");
    g.addColorStop(0.6, "#3e3d30");
    g.addColorStop(1, "#2a241c");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    // wainscot stripe
    c.fillStyle = "#5a2420";
    c.fillRect(0, s * 0.62, s, 12);
    noise(c, s, 9000, 0.12);
    // drips
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * s;
      const len = 40 + Math.random() * 200;
      c.fillStyle = `rgba(30,18,8,${0.15 + Math.random() * 0.25})`;
      c.fillRect(x, 0, 2 + Math.random() * 3, len);
    }
    // scribbled tally marks
    c.strokeStyle = "rgba(120,20,15,0.6)";
    c.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      c.beginPath();
      c.moveTo(300 + i * 12, 200);
      c.lineTo(305 + i * 12, 250);
      c.stroke();
    }
  }, 2);

export const woodTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#4a2e1a";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      c.fillStyle = `rgba(${20 + Math.random() * 40},${10 + Math.random() * 20},5,0.35)`;
      c.fillRect(0, y + Math.sin(y * 0.1) * 2, s, 1);
    }
    noise(c, s, 1500, 0.1);
  });

export const metalTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#4d4f4c";
    c.fillRect(0, 0, s, s);
    noise(c, s, 5000, 0.2);
    for (let i = 0; i < 20; i++) {
      c.fillStyle = `rgba(110,50,15,${Math.random() * 0.4})`;
      c.beginPath();
      c.arc(Math.random() * s, Math.random() * s, 4 + Math.random() * 22, 0, 7);
      c.fill();
    }
  });

export const posterTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#c9b98a";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#7a1a14";
    c.font = "bold 30px serif";
    c.textAlign = "center";
    c.fillText("JOLLY TOYS", s / 2, 40);
    c.font = "16px serif";
    c.fillText("CO. — EST. 1962", s / 2, 62);
    // smiling face
    c.fillStyle = "#e8d6a8";
    c.beginPath();
    c.arc(s / 2, 150, 60, 0, 7);
    c.fill();
    c.fillStyle = "#111";
    c.beginPath();
    c.arc(s / 2 - 22, 135, 9, 0, 7);
    c.arc(s / 2 + 22, 135, 9, 0, 7);
    c.fill();
    c.strokeStyle = "#111";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(s / 2, 155, 32, 0.2, Math.PI - 0.2);
    c.stroke();
    c.fillStyle = "#7a1a14";
    c.font = "bold 18px serif";
    c.fillText("SMILE! WE'RE WATCHING", s / 2, 240);
    noise(c, s, 4000, 0.25);
  });

export const keycardTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#d9e8ef";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#1f6f8b";
    c.fillRect(0, 0, s, 60);
    c.fillStyle = "#fff";
    c.font = "bold 26px sans-serif";
    c.fillText("SECURITY", 14, 42);
    c.fillStyle = "#222";
    c.font = "bold 20px sans-serif";
    c.fillText("LEVEL 3 ACCESS", 14, 110);
    c.font = "16px monospace";
    c.fillText("ID: 0451-JT", 14, 140);
    c.fillStyle = "#c9a227";
    c.fillRect(14, 170, 60, 44);
  });
