// CommissionForm.jsx — Commission inquiry form
const CommissionForm = ({ lang, onClose }) => {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', type: '', size: '', message: '' });

  const t = {
    en: {
      title: 'Commission a Piece',
      sub: "Describe your vision and we'll be in touch within 48 hours.",
      name: 'Full Name', namePh: 'Your name',
      email: 'Email Address', emailPh: 'you@example.com',
      type: 'Work Type', typePh: 'Select…',
      size: 'Approximate Size', sizePh: 'e.g. 40–60cm',
      message: 'Your Vision', messagePh: 'Describe the piece you have in mind…',
      submit: 'Send Inquiry',
      types: ['Sculpture', 'Portrait', 'Abstract', 'Relief', 'Custom'],
      successTitle: 'Inquiry Received',
      successMsg: "We'll respond within 48 hours.",
      back: '← Back to Gallery',
    },
    ar: {
      title: 'طلب عمل فني',
      sub: 'صِف رؤيتك وسنتواصل معك خلال ٤٨ ساعة.',
      name: 'الاسم الكامل', namePh: 'اسمك',
      email: 'البريد الإلكتروني', emailPh: 'example@mail.com',
      type: 'نوع العمل', typePh: 'اختر…',
      size: 'الحجم التقريبي', sizePh: 'مثلاً: ٤٠–٦٠ سم',
      message: 'رؤيتك', messagePh: 'صف القطعة التي تريدها…',
      submit: 'إرسال الطلب',
      types: ['منحوتة', 'بورتريه', 'تجريدي', 'بارز', 'مخصص'],
      successTitle: 'تم استلام طلبك',
      successMsg: 'سنرد عليك خلال ٤٨ ساعة.',
      back: '→ العودة للمعرض',
    },
  };
  const tx = t[lang];
  const isRtl = lang === 'ar';

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <div style={formStyles.wrap}>
        <div style={formStyles.success}>
          <div style={formStyles.successIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={formStyles.successTitle}>{tx.successTitle}</h2>
          <p style={formStyles.successMsg}>{tx.successMsg}</p>
          <button onClick={onClose} style={formStyles.backBtn}>{tx.back}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...formStyles.wrap, direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={formStyles.header}>
        <div style={formStyles.headerLine}></div>
        <h1 style={{ ...formStyles.title, fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>{tx.title}</h1>
        <p style={{ ...formStyles.sub, fontFamily: isRtl ? "'Tajawal', sans-serif" : "'DM Sans', sans-serif" }}>{tx.sub}</p>
      </div>

      <div style={formStyles.form}>
        <div style={formStyles.row}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>{tx.name}</label>
            <input style={formStyles.input} placeholder={tx.namePh} value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>{tx.email}</label>
            <input style={formStyles.input} type="email" placeholder={tx.emailPh} value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
        </div>

        <div style={formStyles.row}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>{tx.type}</label>
            <select style={formStyles.select} value={form.type} onChange={e => update('type', e.target.value)}>
              <option value="">{tx.typePh}</option>
              {tx.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>{tx.size}</label>
            <input style={formStyles.input} placeholder={tx.sizePh} value={form.size} onChange={e => update('size', e.target.value)} />
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label}>{tx.message}</label>
          <textarea style={formStyles.textarea} placeholder={tx.messagePh} value={form.message} onChange={e => update('message', e.target.value)} />
        </div>

        <button style={formStyles.submit} onClick={() => setSubmitted(true)}>{tx.submit}</button>
      </div>
    </div>
  );
};

const formStyles = {
  wrap: { maxWidth: '760px', margin: '0 auto', padding: '64px 0 80px' },
  header: { marginBottom: '48px' },
  headerLine: { width: '40px', height: '1px', background: '#9A7A4A', marginBottom: '24px' },
  title: { fontSize: '48px', fontWeight: 300, color: '#F5F0E8', lineHeight: 1.1, marginBottom: '14px' },
  sub: { fontSize: '15px', color: '#A09A90', lineHeight: 1.7 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5450' },
  input: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#F5F0E8', background: '#141414', border: '1px solid #2A2724', padding: '13px 14px', outline: 'none', borderRadius: 0 },
  select: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#F5F0E8', background: '#141414', border: '1px solid #2A2724', padding: '13px 14px', outline: 'none', borderRadius: 0, WebkitAppearance: 'none', cursor: 'pointer' },
  textarea: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#F5F0E8', background: '#141414', border: '1px solid #2A2724', padding: '13px 14px', outline: 'none', borderRadius: 0, minHeight: '120px', resize: 'vertical' },
  submit: { fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F5F0E8', background: '#8C1A1A', border: 'none', padding: '16px 40px', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '8px' },
  success: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px', textAlign: 'center' },
  successIcon: { width: '72px', height: '72px', border: '1px solid #9A7A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, color: '#F5F0E8' },
  successMsg: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#A09A90' },
  backBtn: { fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.12em', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px' },
};

Object.assign(window, { CommissionForm });
