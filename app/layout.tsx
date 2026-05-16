export const metadata = {
  title: 'Mera AI Assistant',
  description: 'Mera Personal AI Assistant',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
