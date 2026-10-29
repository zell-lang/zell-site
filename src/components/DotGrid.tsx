import { useEffect, useRef } from "react";
import { reducedMotion } from "../site";

/** Hero background: a quiet dot grid with a slow wave of brightness. */
export default function DotGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    let w = 0, h = 0, raf = 0, visible = true;

    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const step = 28;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const fade = Math.max(0, 1 - x / (w * 0.9)) * 0.5 + 0.08;
          const wave = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.018 - t * 0.0009);
          ctx.globalAlpha = (0.05 + 0.13 * wave * wave) * fade;
          ctx.fillRect(x, y, 1.6, 1.6);
        }
      }
      ctx.globalAlpha = 1;
    }
    const onResize = () => { size(); draw(performance.now()); };

    size();
    addEventListener("resize", onResize);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    if (reducedMotion()) draw(0);
    else {
      io.observe(cv);
      const loop = (t: number) => { if (visible && !document.hidden) draw(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => { removeEventListener("resize", onResize); io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
