import { useRef, useEffect } from 'react';

const FreehandCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grundstil för pennan
    ctx.lineWidth = 6; // Tjockare penna
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const handleMouseDown = (e: MouseEvent) => {
      isDrawingRef.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Rensa canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          backgroundColor: '#ddd',
          border: '1px solid #444',
          cursor: 'crosshair',
          display: 'block',
        }}
      />
      <button
        onClick={handleClear}
        style={{
          marginTop: '10px',
          padding: '6px 12px',
          border: '1px solid #333',
          background: '#eee',
          cursor: 'pointer',
        }}>
        Rensa
      </button>
    </div>
  );
};

export default FreehandCanvas;
