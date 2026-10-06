export function WheatMark({ className }: { className?: string }) {
  return (
    <img
      src="/farmish-logo.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`object-contain ${className ?? ""}`}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <img
      src="/farmish-text.png"
      alt="Farmish"
      draggable={false}
      className={`object-contain ${className ?? ""}`}
    />
  );
}
