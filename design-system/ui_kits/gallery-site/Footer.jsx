// Footer.jsx — Site footer
const Footer = ({ lang }) => {
  const t = {
    en: {
      tagline: 'Printing that transforms matter into art.',
      links: [['Gallery', '#'], ['About', '#'], ['Process', '#'], ['Commission', '#'], ['Contact', '#']],
      rights: '© 2024 Majed Almasmoum. All rights reserved.',
      social: 'Instagram',
    },
    ar: {
      tagline: 'طباعة تحوّل المادة إلى فن.',
      links: [['المعرض', '#'], ['عن الفنان', '#'], ['الأسلوب', '#'], ['طلب عمل', '#'], ['تواصل', '#']],
      rights: '© ٢٠٢٤ معرض ماجد المصموم. جميع الحقوق محفوظة.',
      social: 'إنستغرام',
    },
  };
  const tx = t[lang];
  const isRtl = lang === 'ar';

  return (
    <footer style={{ ...footerStyles.wrap, direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={footerStyles.top}>
        <div style={footerStyles.brand}>
          <div style={footerStyles.monogram}>M</div>
          <div style={footerStyles.brandName}>MAJED ALMASMOUM</div>
          <p style={{ ...footerStyles.tagline, fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
            {tx.tagline}
          </p>
        </div>
        <nav style={footerStyles.links}>
          {tx.links.map(([label, href]) => (
            <a key={label} href={href} style={footerStyles.link}>{label}</a>
          ))}
        </nav>
      </div>
      <div style={footerStyles.divider}></div>
      <div style={footerStyles.bottom}>
        <span style={footerStyles.rights}>{tx.rights}</span>
        <a href="#" style={footerStyles.social}>{tx.social} ↗</a>
      </div>
    </footer>
  );
};

const footerStyles = {
  wrap: { background: '#0D0B0B', borderTop: '1px solid #2A2724', padding: '56px 0 32px' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
  brand: { display: 'flex', flexDirection: 'column', gap: '10px' },
  monogram: { fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, fontStyle: 'italic', color: '#B22222', lineHeight: 1 },
  brandName: { fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#F5F0E8' },
  tagline: { fontSize: '18px', fontWeight: 300, fontStyle: 'italic', color: '#5A5450', marginTop: '4px' },
  links: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' },
  link: { fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5450', textDecoration: 'none', transition: 'color 200ms ease' },
  divider: { borderTop: '1px solid #1E1C1C', marginBottom: '24px' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rights: { fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#5A5450', letterSpacing: '0.04em' },
  social: { fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#9A7A4A', letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase' },
};

Object.assign(window, { Footer });
