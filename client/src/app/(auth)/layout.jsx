
export default function AuthLayout({ children }) {
  return (   
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4">
          <div className="w-full max-w-md">{children}</div>
        </div>
  );
}
