export default function Footer() {
  return (
    <footer className="bg-secondary py-4 mt-16 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Vibrafit. All rights reserved.
      </div>
    </footer>
  );
}
