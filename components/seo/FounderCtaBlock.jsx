import Link from 'next/link';

const styles = {
  wrap: {
    marginTop: 40,
    padding: 20,
    borderRadius: 12,
    border: '1px solid rgba(255,159,28,0.25)',
    background: 'linear-gradient(180deg, rgba(255,159,28,0.08), rgba(139,92,246,0.08))',
  },
  title: {
    margin: '0 0 8px',
    fontSize: 18,
    color: '#F0F4FF',
    fontWeight: 700,
  },
  text: {
    margin: '0 0 16px',
    fontSize: 14,
    lineHeight: 1.7,
    color: '#b8c5e0',
  },
  links: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  link: {
    color: '#000',
    background: '#FF9F1C',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  sublink: {
    color: '#22D3EE',
    textDecoration: 'none',
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    padding: '10px 0',
  },
};

export default function FounderCtaBlock({
  title = 'Building something real?',
  text = 'If your project may need to raise more than once, Mammoth is built for continuity, holder protection, and cleaner token capital formation.',
}) {
  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.text}>{text}</p>
      <div style={styles.links}>
        <Link href="/for-founders/is-mammoth-right-for-your-project" style={styles.link}>Is Mammoth right for your project?</Link>
        <Link href="/compare/mammoth-vs-pump-fun" style={styles.link}>Compare Mammoth vs pump.fun</Link>
        <Link href="/for-founders/how-to-structure-a-second-token-raise" style={styles.sublink}>How to structure a second token raise →</Link>
        <Link href="/for-founders/how-to-design-a-token-raise-for-long-term-growth" style={styles.sublink}>How to design a token raise →</Link>
      </div>
    </div>
  );
}
