type IconName = 'prism' | 'arrow' | 'reset' | 'play' | 'pause' | 'sun' | 'help' | 'expand' | 'close' | 'check' | 'book'
const paths: Record<IconName, string> = {
  prism: 'M12 3 2 20h20L12 3ZM12 3v17M2 20l10-6 10 6',
  arrow: 'M5 12h14m-5-5 5 5-5 5', reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  play: 'm8 5 11 7-11 7V5Z', pause: 'M8 5v14M16 5v14',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  help: 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 3m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5', close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6', book: 'M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15',
}
export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
