/** Remounts on every navigation inside this section, giving each screen a short entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="screen-in">{children}</div>;
}
