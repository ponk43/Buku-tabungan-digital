/**
 * Preset logo resmi pesantren islami (SVG data URI mandiri, tanpa ketergantungan internet)
 */

export interface LogoPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

// SVG Preset 1: Kubah Masjid Hijau Emas
const svgKubah = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#065f46" />
    </linearGradient>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#bgG)" />
  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#goldG)" stroke-width="2" stroke-dasharray="4 2" opacity="0.7"/>
  <!-- Bulan Sabit & Bintang Puncak -->
  <path d="M60 22 C64 22 67 25 66 29 C63 26 59 27 58 30 C57 26 60 22 60 22 Z" fill="url(#goldG)"/>
  <circle cx="63" cy="24" r="1.5" fill="#fef08a"/>
  <!-- Kubah Utama -->
  <path d="M60 30 C45 38 40 54 40 68 L80 68 C80 54 75 38 60 30 Z" fill="url(#goldG)"/>
  <!-- Jendela Lengkung Kubah -->
  <path d="M48 68 L48 58 C48 54 52 52 52 52 C52 52 56 54 56 58 L56 68 Z" fill="#064e3b"/>
  <path d="M64 68 L64 58 C64 54 68 52 68 52 C68 52 72 54 72 58 L72 68 Z" fill="#064e3b"/>
  <!-- Dasar Bangunan -->
  <rect x="36" y="68" width="48" height="6" rx="2" fill="url(#goldG)"/>
  <rect x="32" y="74" width="56" height="8" rx="2" fill="#fef08a"/>
  <!-- Pilar Gerbang -->
  <path d="M54 74 L54 86 C54 86 60 82 66 86 L66 74 Z" fill="#064e3b"/>
  <!-- Teks Arab / Simbol Kaligrafi -->
  <text x="60" y="102" font-family="sans-serif" font-size="9" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">PESANTREN</text>
</svg>`;

// SVG Preset 2: Kitab Suci Al-Qur'an Terbuka & Sinar Ilmu
const svgQuran = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgQ" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="goldQ" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="60%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#bgQ)" />
  <circle cx="60" cy="60" r="51" fill="none" stroke="url(#goldQ)" stroke-width="2.5" />
  <!-- Bintang Delapan Penjuru (Rub el Hizb) -->
  <g transform="translate(60, 32) scale(0.6)">
    <rect x="-14" y="-14" width="28" height="28" fill="none" stroke="url(#goldQ)" stroke-width="3" />
    <rect x="-14" y="-14" width="28" height="28" fill="none" stroke="url(#goldQ)" stroke-width="3" transform="rotate(45)" />
    <circle cx="0" cy="0" r="4" fill="#fef08a" />
  </g>
  <!-- Al-Qur'an Terbuka -->
  <path d="M60 56 C50 51 38 53 28 58 L28 82 C38 77 50 75 60 80 C70 75 82 77 92 82 L92 58 C82 53 70 51 60 56 Z" fill="#ffffff" stroke="url(#goldQ)" stroke-width="2"/>
  <!-- Garis Teks Mushaf -->
  <line x1="36" y1="63" x2="52" y2="60" stroke="#047857" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="36" y1="68" x2="52" y2="65" stroke="#047857" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="36" y1="73" x2="48" y2="71" stroke="#047857" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="68" y1="60" x2="84" y2="63" stroke="#047857" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="68" y1="65" x2="84" y2="68" stroke="#047857" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="72" y1="71" x2="84" y2="73" stroke="#047857" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Dudukan Al-Quran (Rehal) -->
  <path d="M42 80 L34 94 L46 94 L60 83 L74 94 L86 94 L78 80 Z" fill="url(#goldQ)"/>
  <text x="60" y="107" font-family="sans-serif" font-size="8" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="1">TAHFIDZ QURAN</text>
</svg>`;

// SVG Preset 3: Menara Masjid & Bulan Bintang Emas
const svgMenara = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042f2e" />
      <stop offset="50%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>
    <linearGradient id="goldM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#bgM)" />
  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#goldM)" stroke-width="2" />
  <!-- Menara Kiri & Kanan -->
  <rect x="30" y="44" width="8" height="42" fill="url(#goldM)" rx="1"/>
  <polygon points="30,44 34,34 38,44" fill="#fbbf24"/>
  <rect x="82" y="44" width="8" height="42" fill="url(#goldM)" rx="1"/>
  <polygon points="82,44 86,34 90,44" fill="#fbbf24"/>
  <!-- Kubah Tengah -->
  <path d="M60 26 C48 36 44 48 44 62 L76 62 C76 48 72 36 60 26 Z" fill="#ffffff"/>
  <path d="M60 21 L60 26" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="60" cy="20" r="2.5" fill="#fbbf24"/>
  <rect x="42" y="62" width="36" height="24" fill="url(#goldM)" rx="2"/>
  <!-- Pintu Gerbang Megah -->
  <path d="M53 86 L53 72 C53 68 60 65 60 65 C60 65 67 68 67 72 L67 86 Z" fill="#042f2e"/>
  <!-- Lentera -->
  <circle cx="60" cy="50" r="3" fill="#fbbf24"/>
  <text x="60" y="103" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1.5">DARUL HIKMAH</text>
</svg>`;

// SVG Preset 4: Lambang Pena, Buku & Obor Ilmu
const svgPena = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgP" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#065f46" />
    </linearGradient>
    <linearGradient id="goldP" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#bgP)" />
  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#goldP)" stroke-width="2" stroke-dasharray="3 3"/>
  <!-- Sayap/Pita Lambang -->
  <path d="M28 66 C36 60 48 62 60 68 C72 62 84 60 92 66 C86 78 72 82 60 76 C48 82 34 78 28 66 Z" fill="#ffffff" opacity="0.9"/>
  <!-- Pena Bulu Emas -->
  <path d="M60 24 C64 36 66 48 60 64 C54 48 56 36 60 24 Z" fill="url(#goldP)"/>
  <circle cx="60" cy="22" r="3" fill="#fef08a"/>
  <!-- Tangga / Garis Ilmu -->
  <line x1="42" y1="84" x2="78" y2="84" stroke="url(#goldP)" stroke-width="3" stroke-linecap="round"/>
  <line x1="48" y1="89" x2="72" y2="89" stroke="url(#goldP)" stroke-width="2.5" stroke-linecap="round"/>
  <text x="60" y="104" font-family="sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">ILMU & AKHLAK</text>
</svg>`;

// Convert SVG string to base64 data URI safely
function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const presetLogos: LogoPreset[] = [
  {
    id: 'kubah-emas',
    name: 'Kubah Masjid Hijau Emas',
    category: 'Islami Modern',
    url: svgToDataUri(svgKubah),
  },
  {
    id: 'quran-bintang',
    name: 'Al-Qur\'an & Bintang Delapan',
    category: 'Tahfidz & Salaf',
    url: svgToDataUri(svgQuran),
  },
  {
    id: 'menara-kembar',
    name: 'Menara & Gerbang Utama',
    category: 'Pesantren Terpadu',
    url: svgToDataUri(svgMenara),
  },
  {
    id: 'pena-ilmu',
    name: 'Pena Ilmu & Akhlak Santri',
    category: 'Pendidikan Islam',
    url: svgToDataUri(svgPena),
  },
  {
    id: 'darul-hikmah-emblem',
    name: 'Foto Gedung Asrama Pesantren',
    category: 'Foto Asli',
    url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'santri-belajar',
    name: 'Ilustrasi Santri Belajar',
    category: 'Foto Santri',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=200&auto=format&fit=crop&q=80',
  },
];

export const defaultPesantrenLogo = presetLogos[0].url;
