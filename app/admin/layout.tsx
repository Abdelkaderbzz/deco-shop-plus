// Root admin layout — no auth here.
// Auth is enforced in app/admin/(dashboard)/layout.tsx only.
// This layout exists solely to avoid Next.js layout conflicts.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
