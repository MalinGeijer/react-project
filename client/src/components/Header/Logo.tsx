import { useNavigate } from 'react-router-dom';
import { SITE_TAGLINE, SITE_TITLE } from '../../config/site';

export function Logo() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/'); 
  };

  return (
    <svg
      viewBox="0 0 420 160"
      className="w-full max-w-[420px] h-auto cursor-pointer"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      onClick={handleClick}
    >
      {/* Ram */}
      <rect
        x="10"
        y="10"
        width="400"
        height="140"
        rx="10"
        fill="#1e1e1e"
        stroke="black"
        strokeWidth="2"
      />

      {/* Titel */}
      <text
        x="210"
        y="75"
        textAnchor="middle"
        fontSize="48"
        fontWeight="600"
        letterSpacing="4"
        fill="#ffb240"
      >
        {SITE_TITLE}
      </text>

      {/* Tagline */}
      <text
        x="210"
        y="115"
        textAnchor="middle"
        fontSize="16"
        opacity="0.7"
        fill="#a3a3a3"
        letterSpacing="1.5"
      >
        {SITE_TAGLINE}
      </text>
    </svg>
  );
}
