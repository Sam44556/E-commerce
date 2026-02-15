

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className=" mx-auto px-4 py-6">
        <div className=" items-center">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} ShopHub. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}
