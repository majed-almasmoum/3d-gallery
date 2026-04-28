// ArtworkDetail.jsx — Lightbox/detail overlay for an artwork
const ArtworkDetail = ({ artwork, lang, onClose, onCommission }) => {
  if (!artwork) return null;

  const t = {
    en: { material: 'Material', size: 'Dimensions', edition: 'Edition', year: 'Year', commission: 'Commission a Similar Piece', close: 'Close', inquire: 'Inquire to Purchase', available: 'Available', category: 'Category' },
    ar: { material: 'الخامة', size: 'الأبعاد', edition: 'الإصدار', year: 'السنة', commission: 'طلب عمل مماثل', close: 'إغلاق', inquire: 'استفسار للشراء', available: 'متاح', category: 'التصنيف' },
  };
  const tx = t[lang];

  return (
    <div style={detailStyles.overlay} onClick={onClose}>
      <div style={detailStyles.panel} onClick={e => e.stopPropagation()}>
        {/* Image side */}
        <div style={detailStyles.imgSide}>
          <div style={{ ...detailStyles.img, background: artwork.color }}>
            <svg width="80" height="80" viewBox="0 0 48 48" fill="none" stroke="#C9A96E" strokeWidth="0.6" opacity="0.35">
              <rect x="4" y="4" width="40" height="40"/>
              <path d="M4 32l10-12 8 10 8-14 14 16"/>
              <circle cx="34" cy="16" r="4"/>
            </svg>
          </div>
          <div style={detailStyles.imgCaption}>
            {lang === 'en' ? artwork.material : artwork.materialAr} · {artwork.size}
          </div>
        </div>

        {/* Info side */}
        <div style={detailStyles.infoSide}>
          <button onClick={onClose} style={detailStyles.closeBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div style={detailStyles.category}>{artwork.category.toUpperCase()}</div>
          <h2 style={detailStyles.title}>
            {lang === 'en' ? artwork.title : artwork.titleAr}
          </h2>
          <div style={detailStyles.price}>{artwork.price}</div>

          <div style={detailStyles.divider}></div>

          <div style={detailStyles.specs}>
            {[
              { label: tx.year, value: artwork.year },
              { label: tx.material, value: lang === 'en' ? artwork.material : artwork.materialAr },
              { label: tx.size, value: artwork.size },
              { label: tx.edition, value: `Ed. ${artwork.edition}` },
              { label: tx.category, value: artwork.category },
            ].map(({ label, value }) => (
              <div key={label} style={detailStyles.specRow}>
                <span style={detailStyles.specLabel}>{label}</span>
                <span style={detailStyles.specValue}>{value}</span>
              </div>
            ))}
          </div>

          <div style={detailStyles.divider}></div>

          <div style={detailStyles.statusBadge}>
            <span style={detailStyles.dot}></span>
            {tx.available}
          </div>

          <div style={detailStyles.actions}>
            <button style={detailStyles.btnPrimary}>{tx.inquire}</button>
            <button onClick={onCommission} style={detailStyles.btnGold}>{tx.commission}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const detailStyles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(5,5,5,0.85)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px',
  },
  panel: {
    background: '#141414',
    border: '1px solid #2A2724',
    boxShadow: '0 16px 64px rgba(0,0,0,0.8)',
    display: 'flex', maxWidth: '900px', width: '100%',
    maxHeight: '80vh', overflow: 'hidden',
  },
  imgSide: {
    flex: '0 0 420px',
    display: 'flex', flexDirection: 'column',
    borderRight: '1px solid #2A2724',
  },
  img: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '320px',
  },
  imgCaption: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px', letterSpacing: '0.1em',
    color: '#5A5450', padding: '10px 16px',
    borderTop: '1px solid #2A2724',
    textTransform: 'uppercase',
  },
  infoSide: {
    flex: 1, padding: '32px 36px',
    overflowY: 'auto', position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: '20px', right: '20px',
    background: 'none', border: '1px solid #2A2724',
    color: '#5A5450', cursor: 'pointer',
    width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 200ms ease',
  },
  category: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px', letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#5A5450',
    marginBottom: '10px',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '36px', fontWeight: 300,
    color: '#F5F0E8', lineHeight: 1.15,
    marginBottom: '12px',
  },
  price: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '20px', fontWeight: 500,
    color: '#C9A96E',
  },
  divider: {
    borderTop: '1px solid #2A2724',
    margin: '20px 0', opacity: 0.6,
  },
  specs: { display: 'flex', flexDirection: 'column', gap: '10px' },
  specRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  specLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#5A5450',
  },
  specValue: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px', color: '#A09A90',
  },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#C9A96E',
    background: 'rgba(201,169,110,0.08)',
    border: '1px solid #9A7A4A',
    padding: '6px 12px',
    marginBottom: '20px',
  },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#C9A96E', flexShrink: 0,
  },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  btnPrimary: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#F5F0E8', background: '#8C1A1A',
    border: 'none', padding: '14px', cursor: 'pointer',
  },
  btnGold: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 400,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#C9A96E', background: 'transparent',
    border: '1px solid #9A7A4A', padding: '13px', cursor: 'pointer',
  },
};

Object.assign(window, { ArtworkDetail });
