import ForceDark from '../ForceDark';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceDark />
      {children}
    </>
  );
}
