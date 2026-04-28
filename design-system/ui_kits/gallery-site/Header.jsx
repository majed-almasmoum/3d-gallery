// Header.jsx — Majed Almasmoum Gallery
const Header = ({ lang, onLangToggle, currentPage, onNav }) => {
  const t = {
    en: { gallery: 'Gallery', about: 'About', process: 'Process', contact: 'Contact', commission: 'Commission', brand: 'MAJED ALMASMOUM' },
    ar: { gallery: 'المعرض', about: 'عن الفنان', process: 'الأسلوب', contact: 'تواصل', commission: 'طلب عمل', brand: 'معرض ماجد المصموم' }
  };
  const tx = t[lang];
  const navItems = [
    { key: 'home', label: tx.gallery },
    { key: 'about', label: tx.about },
    { key: 'process', label: tx.process },
    { key: 'contact', label: tx.contact },
  ];
  return (
    <header style={headerStyles.nav}>
      <button onClick={() => onNav('home')} style={headerStyles.logo}>
        <span style={headerStyles.monogram}>M</span>
        <span style={headerStyles.brandName}>{tx.brand}</span>
      </button>
      <nav style={headerStyles.links}>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            style={{
              ...headerStyles.link,
              ...(currentPage === item.key ? headerStyles.linkActive : {})
            }}
          >{item.label}</button>
        ))}
      </nav>
      <button onClick={onLangToggle} style={headerStyles.langBtn}>
        {lang === 'en' ? 'AR' : 'EN'}
      </button>
      <button onClick={() => onNav('commission')} style={headerStyles.cta}>{tx.commission}</button>
    </header>
  );
};

const headerStyles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: '72px',
    background: 'rgba(10,10,10,0.88)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2A2724',
    display: 'flex', alignItems: 'center',
    padding: '0 48px', gap: '40px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'none', border: 'none', cursor: 'pointer',
    marginRight: 'auto', textDecoration: 'none', padding: 0,
  },
  monogram: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '30px', fontWeight: 400, fontStyle: 'italic',
    color: '#B22222', lineHeight: 1,
  },
  brandName: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: '#F5F0E8',
  },
  links: { display: 'flex', gap: '32px', alignItems: 'center' },
  link: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 400,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: '#A09A90', background: 'none', border: 'none',
    cursor: 'pointer', padding: '4px 0',
    transition: 'color 200ms ease',
  },
  linkActive: {
    color: '#F5F0E8',
    borderBottom: '1px solid #9A7A4A',
  },
  langBtn: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', letterSpacing: '0.1em',
    color: '#5A5450', background: 'none', border: 'none',
    cursor: 'pointer', transition: 'color 200ms ease',
  },
  cta: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#F5F0E8', background: '#8C1A1A',
    border: 'none', padding: '10px 22px',
    cursor: 'pointer', transition: 'background 200ms ease',
  },
};

Object.assign(window, { Header });
