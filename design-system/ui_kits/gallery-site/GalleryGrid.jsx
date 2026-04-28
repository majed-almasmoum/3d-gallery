// GalleryGrid.jsx — Artwork grid with filters
const ARTWORKS = [
  { id: 1, title: 'Untitled Form No. 7', titleAr: 'شكل بلا عنوان رقم ٧', category: 'sculpture', year: 2024, material: 'Resin composite', materialAr: 'راتنج مركّب', size: '42cm', edition: '3/12', price: 'SAR 4,200', featured: false, color: '#1A1410' },
  { id: 2, title: 'Echoes in Space', titleAr: 'أصداء في الفضاء', category: 'abstract', year: 2024, material: 'Bronze-finish resin', materialAr: 'راتنج بتشطيب برونزي', size: '68cm', edition: '1/5', price: 'SAR 12,500', featured: true, color: '#1A1510' },
  { id: 3, title: 'Portrait of M.', titleAr: 'بورتريه م.', category: 'portrait', year: 2023, material: 'White resin', materialAr: 'راتنج أبيض', size: '35cm', edition: '2/8', price: 'SAR 6,800', featured: false, color: '#161616' },
  { id: 4, title: 'Threshold', titleAr: 'العتبة', category: 'sculpture', year: 2024, material: 'Matte black resin', materialAr: 'راتنج أسود مطفأ', size: '55cm', edition: '1/10', price: 'SAR 8,900', featured: false, color: '#111111' },
  { id: 5, title: 'Vessel Series I', titleAr: 'سلسلة الإناء I', category: 'abstract', year: 2023, material: 'Ceramic-finish resin', materialAr: 'راتنج بتشطيب سيراميك', size: '30cm', edition: '4/10', price: 'SAR 3,400', featured: false, color: '#181410' },
  { id: 6, title: 'Suspended Geometry', titleAr: 'هندسة معلّقة', category: 'sculpture', year: 2024, material: 'Polished white resin', materialAr: 'راتنج أبيض مصقول', size: '80cm', edition: '1/3', price: 'SAR 18,000', featured: true, color: '#151515' },
];

const CATEGORIES = {
  en: ['All', 'Sculpture', 'Abstract', 'Portrait'],
  ar: ['الكل', 'منحوتة', 'تجريدي', 'بورتريه'],
};
const CAT_KEYS = ['all', 'sculpture', 'abstract', 'portrait'];

// Placeholder image for artworks
const ArtworkPlaceholder = ({ color, featured }) => (
  <div style={{ width: '100%', aspectRatio: featured ? '3/4' : '4/3', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9A96E" strokeWidth="0.8" opacity="0.4">
      <rect x="4" y="4" width="40" height="40"/>
      <path d="M4 32l10-12 8 10 8-14 14 16"/>
      <circle cx="34" cy="16" r="4"/>
    </svg>
  </div>
);

const GalleryGrid = ({ lang, onArtworkClick }) => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const cats = CATEGORIES[lang];

  const filtered = activeFilter === 'all'
    ? ARTWORKS
    : ARTWORKS.filter(a => a.category === activeFilter);

  return (
    <div style={gridStyles.wrap}>
      {/* Filter bar */}
      <div style={gridStyles.filters}>
        {CAT_KEYS.map((key, i) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            style={{ ...gridStyles.filterBtn, ...(activeFilter === key ? gridStyles.filterActive : {}) }}
          >{cats[i]}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={gridStyles.grid}>
        {filtered.map(art => (
          <div
            key={art.id}
            onClick={() => onArtworkClick(art)}
            style={{ ...gridStyles.card, ...(art.featured ? gridStyles.cardFeatured : {}) }}
          >
            <div style={gridStyles.imgWrap}>
              <ArtworkPlaceholder color={art.color} featured={art.featured} />
              {art.featured && (
                <div style={gridStyles.featuredBadge}>
                  {lang === 'en' ? 'Featured' : 'مميّز'}
                </div>
              )}
            </div>
            <div style={gridStyles.cardBody}>
              <div style={gridStyles.cardMeta}>
                {art.category.toUpperCase()} · {art.year}
              </div>
              <div style={gridStyles.cardTitle}>
                {lang === 'en' ? art.title : art.titleAr}
              </div>
              <div style={gridStyles.cardSub}>
                {lang === 'en' ? art.material : art.materialAr} · {art.size}
              </div>
            </div>
            <div style={gridStyles.cardFooter}>
              <span style={gridStyles.price}>{art.price}</span>
              <span style={gridStyles.edition}>Ed. {art.edition}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const gridStyles = {
  wrap: { padding: '40px 0' },
  filters: { display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' },
  filterBtn: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '8px 18px',
    background: 'transparent',
    border: '1px solid #2A2724',
    color: '#A09A90', cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  filterActive: {
    borderColor: '#9A7A4A',
    color: '#C9A96E',
    background: 'rgba(201,169,110,0.08)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2px',
  },
  card: {
    background: '#141414',
    border: '1px solid #1E1C1C',
    cursor: 'pointer',
    transition: 'border-color 250ms ease, box-shadow 250ms ease',
  },
  cardFeatured: {
    borderColor: '#9A7A4A',
    boxShadow: '0 0 24px rgba(201,169,110,0.12)',
  },
  imgWrap: { position: 'relative', overflow: 'hidden' },
  featuredBadge: {
    position: 'absolute', top: '12px', left: '12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '9px', fontWeight: 500,
    letterSpacing: '0.16em', textTransform: 'uppercase',
    color: '#C9A96E',
    background: 'rgba(201,169,110,0.12)',
    border: '1px solid #9A7A4A',
    padding: '4px 10px',
  },
  cardBody: { padding: '14px 16px 10px' },
  cardMeta: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '9px', letterSpacing: '0.14em',
    textTransform: 'uppercase', color: '#5A5450',
    marginBottom: '6px',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '18px', fontWeight: 400,
    color: '#F5F0E8', lineHeight: 1.2, marginBottom: '4px',
  },
  cardSub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', color: '#A09A90',
  },
  cardFooter: {
    padding: '10px 16px',
    borderTop: '1px solid #2A2724',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  price: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px', fontWeight: 500, color: '#C9A96E',
  },
  edition: {
    fontFamily: "'Courier New', monospace",
    fontSize: '10px', color: '#5A5450',
  },
};

Object.assign(window, { GalleryGrid, ARTWORKS });
