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
    // dark metal grating base
    c.fillStyle = "#15140f";
    c.fillRect(0, 0, s, s);
    const cell = 64;
    const bar = 6;
    // grating grid — metal bars with open gaps
    for (let x = 0; x < s; x += cell) {
      for (let y = 0; y < s; y += cell) {
        // dark open cell background (suggesting a pit below)
        c.fillStyle = "#050504";
        c.fillRect(x + bar, y + bar, cell - bar * 2, cell - bar * 2);
        // rust-stained metal bars
        const rv = 18 + Math.random() * 12;
        c.fillStyle = `rgb(${rv},${rv - 3},${rv - 6})`;
        c.fillRect(x, y, cell, bar);
        c.fillRect(x, y, bar, cell);
      }
    }
    // grime and rust stains
    noise(c, s, 8000, 0.18);
    for (let i = 0; i < 20; i++) {
      const rx = 60 + Math.random() * 40;
      c.fillStyle = `rgba(${rx},${rx * 0.4},${rx * 0.15},${0.15 + Math.random() * 0.25})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 10 + Math.random() * 40, 8 + Math.random() * 25, Math.random() * 3, 0, 7);
      c.fill();
    }
    // dark oil drips
    for (let i = 0; i < 10; i++) {
      c.fillStyle = `rgba(5,4,3,${0.3 + Math.random() * 0.3})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 8 + Math.random() * 30, 6 + Math.random() * 20, Math.random() * 3, 0, 7);
      c.fill();
    }
  }, 6);

export const wallTex = () =>
  make(512, (c, s) => {
    // dark grime-stained industrial concrete base
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "#1c1a16");
    g.addColorStop(0.5, "#18160f");
    g.addColorStop(1, "#100e0a");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    // concrete texture — mottled patches
    for (let i = 0; i < 60; i++) {
      const v = 12 + Math.random() * 18;
      c.fillStyle = `rgba(${v},${v - 2},${v - 5},${0.15 + Math.random() * 0.2})`;
      c.beginPath();
      c.arc(Math.random() * s, Math.random() * s, 20 + Math.random() * 60, 0, 7);
      c.fill();
    }
    // cracks
    c.strokeStyle = "rgba(5,4,3,0.5)";
    c.lineWidth = 1 + Math.random() * 2;
    for (let i = 0; i < 8; i++) {
      c.beginPath();
      let x = Math.random() * s;
      let y = Math.random() * s;
      c.moveTo(x, y);
      for (let j = 0; j < 6; j++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    // rust stains
    for (let i = 0; i < 18; i++) {
      const rx = 50 + Math.random() * 50;
      c.fillStyle = `rgba(${rx},${rx * 0.35},${rx * 0.12},${0.1 + Math.random() * 0.25})`;
      c.beginPath();
      c.ellipse(Math.random() * s, Math.random() * s, 15 + Math.random() * 50, 10 + Math.random() * 35, Math.random() * 3, 0, 7);
      c.fill();
    }
    noise(c, s, 10000, 0.15);
    // dark grime drips from top
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * s;
      const len = 30 + Math.random() * 180;
      c.fillStyle = `rgba(8,6,4,${0.2 + Math.random() * 0.3})`;
      c.fillRect(x, 0, 2 + Math.random() * 4, len);
    }
    // faint tally marks scratched into wall
    c.strokeStyle = "rgba(80,15,10,0.35)";
    c.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      c.beginPath();
      c.moveTo(300 + i * 12, 200);
      c.lineTo(305 + i * 12, 250);
      c.stroke();
    }
  }, 2);

export const woodTex = () =>
  make(256, (c, s) => {
    // dark rotten wood
    c.fillStyle = "#1e140a";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      c.fillStyle = `rgba(${15 + Math.random() * 25},${8 + Math.random() * 12},3,0.4)`;
      c.fillRect(0, y + Math.sin(y * 0.1) * 2, s, 1);
    }
    noise(c, s, 1500, 0.12);
  });

export const metalTex = () =>
  make(256, (c, s) => {
    // dark rusted metal
    c.fillStyle = "#22201c";
    c.fillRect(0, 0, s, s);
    noise(c, s, 5000, 0.2);
    for (let i = 0; i < 25; i++) {
      const rx = 50 + Math.random() * 60;
      c.fillStyle = `rgba(${rx},${rx * 0.35},${rx * 0.1},${Math.random() * 0.5})`;
      c.beginPath();
      c.arc(Math.random() * s, Math.random() * s, 4 + Math.random() * 25, 0, 7);
      c.fill();
    }
    // dark grime streaks
    for (let i = 0; i < 10; i++) {
      c.fillStyle = `rgba(5,4,3,${0.2 + Math.random() * 0.2})`;
      c.fillRect(Math.random() * s, 0, 2 + Math.random() * 4, s);
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
