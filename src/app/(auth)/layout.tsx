import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col">
      {/* Header minimal */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
          <span className="text-2xl">🚆</span>
          <span className="font-bold text-xl">RailReady</span>
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="p-6 text-center text-blue-400 text-xs">
        Plateforme indépendante · Non affiliée à la SNCF · Version bêta
      </footer>
    </div>
  )
}
