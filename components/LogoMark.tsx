/** Знак Royal Snow: снежинка под короной. Рисуется белым на тёмном фоне. */
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 8.5 5 4l3.2 2.6L12 3.2l3.8 3.4L19 4l-1.5 4.5Z" fill="currentColor" stroke="none" />
      <g transform="translate(0 4.6) scale(.62 .62) translate(7.3 7.3)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} transform={`rotate(${a} 12 12)`} d="M12 12V2.5M9.4 5 12 7.6 14.6 5" />
        ))}
      </g>
    </svg>
  );
}
