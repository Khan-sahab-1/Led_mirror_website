import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container section text-center py-60">
        <div className="glass-panel p-40 max-w-500 m-auto">
          <span className="eyebrow-luxury">404 — MIRROR NOT FOUND</span>
          <h1 className="serif-title mt-10">Reflecting on the Unknown</h1>
          <p className="muted mb-25">
            The page or mirror design you are looking for does not exist or may have been relocated.
          </p>
          <div className="flex-center gap-14">
            <Link href="/" className="btn btn-luxury">
              Return Home
            </Link>
            <Link href="/#shop" className="btn secondary">
              Browse Catalogue
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

