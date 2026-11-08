
'use client';

import './ProgressBar.css';

interface ProgressBarProps {
  label?: string;
  visible?: boolean;
  className?: string;
}

export default function ProgressBar({
  label = 'Please wait',
  visible = true,
  className = '',
}: ProgressBarProps) {
  if (!visible) return null;

  return (
    <div
      className={`ms-progress ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuetext={label}
    >
      <div className="ms-progress-track">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="ms-progress-segment"
          />
        ))}
      </div>
    </div>
  );
}
