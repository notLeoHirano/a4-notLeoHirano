"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "nes.css/css/nes.min.css";
import "../main.css";

export default function Page() {
  const [shapes, setShapes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchShapes() {
      const response = await fetch("/api/shapes");
      const shapeData = await response.json();
      setShapes(shapeData);
    }
    fetchShapes();
  }, []);

  const scalePoints = (points: string, scale: number) => {
    return points
      .split(" ")
      .map((point) => {
        const [x, y] = point.split(",").map(Number);
        return `${x * scale},${y * scale}`;
      })
      .join(" ");
  };

  const handleShapeClick = (shape: any) => {
    router.push(`/${JSON.stringify(shape.shape)}`);
  };

  return (
    <div className="gallery-page nes-container is-dark">
      <div className="gallery-title">
        <h1 className="nes-text is-primary">Shape Gallery</h1>
      </div>

      <div className="gallery-grid">
        {shapes.map((shape, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => handleShapeClick(shape)}
          >
            <div className="gallery-image">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <polygon
                  points={scalePoints(shape.shape, 0.3)}
                  fill="rgba(255, 255, 255, 0.3)"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="gallery-info">
              <p>{shape.shapeName}</p>
              <p>{shape.userName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
