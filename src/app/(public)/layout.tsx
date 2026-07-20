export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark" style={{ background: "#07070c", color: "#aeb6cf", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
