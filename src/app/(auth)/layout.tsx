/**
 * (auth) layout — passthrough.
 * Cada página de auth maneja su propio chrome: /login tiene split-screen,
 * /register y /accept-invite usan <AuthCard>.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
