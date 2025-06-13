export function Footer() {
  return (
    <footer className="mt-auto border-t py-4">
      <div className="container max-w-screen-2xl text-center text-xs text-muted-foreground px-4">
        <p>&copy; {new Date().getFullYear()} TrueVintage. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
