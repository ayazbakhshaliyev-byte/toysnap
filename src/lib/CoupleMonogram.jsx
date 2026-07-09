// Ботаническая монограмма пары — двойная рамка-овал с инициалами и золотым "&".
// variant="full" — крупная версия с веточками (страница входа).
// variant="compact" — маленький бейдж без веточек (шапка галереи).
export default function CoupleMonogram({ initial1, initial2, variant = "full", className = "" }) {
  if (!initial1 || !initial2) return null;

  if (variant === "compact") {
    return (
      <svg width="38" height="50" viewBox="0 0 60 78" fill="none" className={className}>
        <rect x="8" y="6" width="44" height="66" rx="22" stroke="#a9853f" strokeWidth="1" />
        <rect x="11" y="9" width="38" height="60" rx="19" stroke="#a9853f" strokeOpacity="0.4" strokeWidth="1" />
        <text x="22" y="47" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontWeight="500" fontSize="26" fill="#23211b">
          {initial1}
        </text>
        <text x="30" y="49" textAnchor="middle" fontFamily="'Pinyon Script',cursive" fontSize="13" fill="#a9853f">
          &amp;
        </text>
        <text x="38" y="47" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontWeight="500" fontSize="26" fill="#23211b">
          {initial2}
        </text>
      </svg>
    );
  }

  const vine = (
    <g stroke="#a9853f" strokeWidth="0.9" strokeLinecap="round" opacity="0.8">
      <path d="M2,4 C -6,20 -6,44 6,62" />
      <ellipse cx="-4" cy="16" rx="6" ry="2.6" transform="rotate(-30 -4 16)" />
      <ellipse cx="-5" cy="28" rx="6.5" ry="2.8" transform="rotate(-16 -5 28)" />
      <ellipse cx="-3" cy="40" rx="6" ry="2.6" transform="rotate(-4 -3 40)" />
      <ellipse cx="2" cy="51" rx="5" ry="2.3" transform="rotate(10 2 51)" />
      <circle cx="-8" cy="22" r="1.6" fill="#a9853f" stroke="none" />
      <circle cx="-9" cy="34" r="1.5" fill="#a9853f" stroke="none" />
    </g>
  );

  return (
    <svg width="138" height="184" viewBox="0 0 150 200" fill="none" className={className}>
      <rect x="33" y="24" width="84" height="152" rx="42" stroke="#a9853f" strokeWidth="1" />
      <rect x="38" y="29" width="74" height="142" rx="37" stroke="#a9853f" strokeOpacity="0.4" strokeWidth="1" />
      <g transform="translate(40,72)">{vine}</g>
      <g transform="translate(110,72) scale(-1,1)">{vine}</g>
      <text x="61" y="118" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontWeight="500" fontSize="54" fill="#2a2620">
        {initial1}
      </text>
      <text x="75" y="124" textAnchor="middle" fontFamily="'Pinyon Script',cursive" fontSize="28" fill="#a9853f">
        &amp;
      </text>
      <text x="89" y="118" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontWeight="500" fontSize="54" fill="#2a2620">
        {initial2}
      </text>
    </svg>
  );
}
