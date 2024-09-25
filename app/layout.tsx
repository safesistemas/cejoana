import './globals.css'

export const metadata = {
  title: 'CE Joana',
  description: 'Centro Espírita Joana D ARC',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
            {children}
        </main>
      </body>
    </html>
  )
}
