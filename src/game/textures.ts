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
    const v = Math.random() * 40;
    c.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    c.fillRect(Math.random() * s, Math.random() * s, 2, 2);
  }
}

/** Dark metallic grunge-stained industrial concrete wall */
export const wallTex = () =>
  make(512, (c, s) => {
    c.fillStyle = "#1a1a1a";
    c.fillRect(0, 0, s, s);
    // mottled concrete patches
    for (let i = 0; i < 80; i++) {
      const v = 10 + Math.random() * 20;
      c.fillStyle = `rgba(${v},${v},${v},${0.1 + Math.random() * 0.2})`;
      c.beginPath();
      c.arc(Math.random() * s, Math.random() * s, 15 + Math.random() * 70, 0, 7);
      c.fill();
    }
    // dark rust streaks
    for (let i = 0; i < 15; i++) {
      const rx = 40 + Math.random() * 40;
      c.fillStyle = `rgba(${rx},${rx * 0.3},${rx * 0.1},${0.08 + Math.random() * 0.15})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 12 + Math.random() * 45, 8 + Math.random() * 30, Math.random() * 3, 0, 7);
      c.fill();
    }
    // cracks
    c.strokeStyle = "rgba(0,0,0,0.5)";
    c.lineWidth = 1 + Math.random();
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      let x = Math.random() * s;
      let y = Math.random() * s;
      c.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 50;
        y += (Math.random() - 0.5) * 50;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    noise(c, s, 8000, 0.12);
    // dark grime drips
    for (let i = 0; i < 25; i++) {
      c.fillStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.25})`;
      c.fillRect(Math.random() * s, 0, 2 + Math.random() * 3, 20 + Math.random() * 150);
    }
  }, 2);

/** Dark metal grating floor */
export const floorTex = () =>
  make(512, (c, s) => {
    c.fillStyle = "#151515";
    c.fillRect(0, 0, s, s);
    const cell = 64;
    const bar = 5;
    for (let x = 0; x < s; x += cell) {
      for (let y = 0; y < s; y += cell) {
        c.fillStyle = "#050505";
        c.fillRect(x + bar, y + bar, cell - bar * 2, cell - bar * 2);
        const v = 20 + Math.random() * 10;
        c.fillStyle = `rgb(${v},${v},${v})`;
        c.fillRect(x, y, cell, bar);
        c.fillRect(x, y, bar, cell);
      }
    }
    noise(c, s, 6000, 0.15);
    for (let i = 0; i < 15; i++) {
      const rx = 40 + Math.random() * 30;
      c.fillStyle = `rgba(${rx},${rx * 0.3},${rx * 0.08},${0.1 + Math.random() * 0.2})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 8 + Math.random() * 35, 6 + Math.random() * 20, Math.random() * 3, 0, 7);
      c.fill();
    }
    for (let i = 0; i < 8; i++) {
      c.fillStyle = `rgba(0,0,0,${0.3 + Math.random() * 0.3})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 6 + Math.random() * 25, 5 + Math.random() * 15, Math.random() * 3, 0, 7);
      c.fill();
    }
  }, 6);

/** Dark rusted metal */
export const metalTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#1c1c1c";
    c.fillRect(0, 0, s, s);
    noise(c, s, 4000, 0.18);
    for (let i = 0; i < 20; i++) {
      const rx = 40 + Math.random() * 50;
      c.fillStyle = `rgba(${rx},${rx * 0.3},${rx * 0.08},${Math.random() * 0.4})`;
      c.beginPath();
      c.arc(Math.random() * s, Math.random() * s, 3 + Math.random() * 20, 0, 7);
      c.fill();
    }
    for (let i = 0; i < 8; i++) {
      c.fillStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.2})`;
      c.fillRect(Math.random() * s, 0, 2 + Math.random() * 3, s);
    }
  });

/** Dark rotten wood */
export const woodTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#181210";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      c.fillStyle = `rgba(${10 + Math.random() * 20},${6 + Math.random() * 10},2,0.4)`;
      c.fillRect(0, y + Math.sin(y * 0.1) * 2, s, 1);
    }
    noise(c, s, 1200, 0.1);
  });

export const posterTex = () =>
  make(256, (c, s) => {
    c.fillStyle = "#2a2520";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#5a1810";
    c.font = "bold 26px serif";
    c.textAlign = "center";
    c.fillText("JOLLY TOYS", s / 2, 40);
    c.font = "14px serif";
    c.fillText("CO. — EST. 1962", s / 2, 60);
    c.fillStyle = "#3a3530";
    c.beginPath();
    c.arc(s / 2, 145, 55, 0, 7);
    c.fill();
    c.fillStyle = "#1a1a1a";
    c.beginPath();
    c.arc(s / 2 - 20, 132, 8, 0, 7);
    c.arc(s / 2 + 20, 132, 8, 0, 7);
    c.fill();
    c.strokeStyle = "#1a1a1a";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(s / 2, 150, 28, 0.2, Math.PI - 0.2);
    c.stroke();
    c.fillStyle = "#5a1810";
    c.font = "bold 15px serif";
    c.fillText("SMILE! WE'RE WATCHING", s / 2, 235);
    noise(c, s, 5000, 0.3);
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
