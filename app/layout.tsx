import './globals.css'

export const metadata = {
  title: 'CE Joana',
  description: 'Centro Espírita Joana D ARC',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className='p-2 bg-white rounded-md shadow-md dark:bg-gray-800'>
        <main>
            {children}
        </main>
      </body>
    </html>
  )
}
