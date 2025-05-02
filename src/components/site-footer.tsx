export function SiteFooter() {
  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>© {new Date().getFullYear()} Christian Chords. All rights reserved.</p>
      </div>
    </footer>
  )
}
