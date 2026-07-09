export default function HeartIcon({ active, size = 22, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 20.5s-7.5-4.6-10-9.3C0.3 8.1 1.6 4.8 4.8 4C7 3.4 9.3 4.3 12 7c2.7-2.7 5-3.6 7.2-3C22.4 4.8 23.7 8.1 22 11.2c-2.5 4.7-10 9.3-10 9.3z" />
    </svg>
  );
}
