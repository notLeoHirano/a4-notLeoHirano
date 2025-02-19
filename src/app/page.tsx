"use client"
import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import "nes.css/css/nes.min.css";
import "./main.css";
import {useRouter} from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const [points, setPoints] = useState<string[]>([]);
  const [originalPoints, setOriginalPoints] = useState<string[]>([]);
  const [shapes, setShapes] = useState<any[]>([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement | null>(null);


  useEffect(() => {
    async function loadShapes() {
      const response = await fetch("/api/shapes");
      const shapeData = await response.json();
      setShapes(shapeData);
    }

    loadShapes();
  }, []);

  function renderPolygon() {
    if (svgRef.current) {
      svgRef.current.innerHTML = "";
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", points.join(" "));
      polygon.setAttribute("fill", "rgba(255, 255, 255, 0.3)");
      polygon.setAttribute("stroke", "white");
      polygon.setAttribute("stroke-width", "2");
      svgRef.current.appendChild(polygon);
    }
  }

  useEffect(() => {
    renderPolygon();
  }, [points]);

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - svgRect.left;
    const y = event.clientY - svgRect.top;

    setPoints((prevPoints) => [...prevPoints, `${Math.round(x)},${Math.round(y)}`]);
  };

  const handleShapeSelection = (index: number) => {
    if (index >= 0 && index < shapes.length) {
      setOriginalPoints(points);
      setPoints(shapes[index].shape.split(" "));
    }
  };

  const handleRevert = () => {
    setPoints(originalPoints);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) {
      alert("You must be logged in to submit a shape.");
      return;
    }

    const shapeName = (document.querySelector("#shapename") as HTMLInputElement)?.value;
    const descriptionText = (document.querySelector("#description") as HTMLTextAreaElement)?.value;

    const response = await fetch("/api/shapes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: session.user?.name || "Anonymous",
        shapeName,
        shape: points.join(" "),
        description: descriptionText,
      }),
    });

    console.log("Response:", await response.text());
    setShapes(await (await fetch("/api/shapes")).json());
  };

  const handleGoToGallery = () => {
    if (router) {
      router.push("/gallery");
    }
  };

  return (
    <div className="body nes-container with-title is-dark">
      <button className="nes-btn" id="toggledata" onClick={() => setIsTableVisible(!isTableVisible)}>
        📋 Toggle Data Table
      </button>

      <button id="gallery"className="nes-btn is-primary" onClick={handleGoToGallery}>Gallery</button>

      {!isTableVisible ? (
        <div id="info" className="nes-container with-title is-rounded">
          <h1 className="nes-text is-primary">Shape Competition!</h1>
          <p className="nes-text">Click on the black canvas to place points of your polygon! Then Submit your shape below!</p>
          <p className="nes-text">To view another shape, select it from the dropdown menu. To view all shapes, toggle to table and click on entries to preview.</p>

          {session ? (
            <>
              <b className="nes-text is-success">Logged in as: {session.user?.name}</b>
              <button className="nes-btn is-warning" onClick={() => signOut()}>Sign Out</button>
            </>
          ) : (
            <button className="nes-btn is-primary" onClick={() => signIn("github")}>Sign in with GitHub</button>
          )}

          {session && (
            <form className="nes-form" onSubmit={handleSubmit}>
              <label htmlFor="shapename" className="nes-text">Shape Name:</label>
              <input type="text" id="shapename" className="nes-input" placeholder="dylan" />

              <label htmlFor="description" className="nes-text">Description (optional):</label>
              <textarea id="description" className="nes-textarea"></textarea>

              <button type="submit" className="nes-btn is-primary">Submit</button>
              <button type="button" onClick={handleRevert} className="nes-btn is-error">Revert</button>

              <label htmlFor="shapeSelect" className="nes-text">View Your Shapes</label>
              <select id="shapeSelect" className="nes-select" onChange={(e) => handleShapeSelection(Number(e.target.value))}>
                <option value="">-- Select a shape --</option>
                {shapes.map((shape, index) => (
                  <option key={index} value={index}>
                    {shape.userName} - {shape.shapeName}
                  </option>
                ))}
              </select>
            </form>
          )}
        </div>
      ) : (
        <div id="table-container" className="nes-container with-title is-dark">
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
            <tr>
              <th>User</th>
              <th>Shape Name</th>
              <th>Description</th>
              <th>Self Titled?</th>
              <th>Points</th>
            </tr>
            </thead>
            <tbody>
            {shapes.map((shape, index) => (
              <tr key={index} onClick={() => setPoints(shape.shape.split(" "))}>
                <td>{shape.userName}</td>
                <td>{shape.shapeName}</td>
                <td>{shape.description || "N/A"}</td>
                <td>{shape.selfTitled ? "Yes" : "No"}</td>
                <td>{shape.shape}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

        <div id="canvas" className="nes-container with-title">
          <svg
            id="drawing-area"
            className="nes-container is-dark"
            width="80%"
            height="90%"
            ref={svgRef}
            onClick={handleCanvasClick}
          ></svg>
        </div>
    </div>
  );
}
