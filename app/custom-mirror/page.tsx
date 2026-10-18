import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomQuoteForm from "@/components/CustomQuoteForm";

export default function CustomMirrorPage() {
  return (
    <>
      <Header />
      <main className="container section-spacing">
        <div className="custom-mirror-header text-center max-w-700 m-auto mb-35">
          <span className="eyebrow-luxury">BESPOKE ATELIER</span>
          <h1 className="serif-heading mt-10">Bespoke Architectural Mirrors</h1>
          <p className="section-subtitle mt-8">
            Whether for a sprawling master vanity, luxury powder room, or boutique retail store,
            our craftsmen cut, bevel, and wire each piece to your exact blueprint.
          </p>
        </div>
        <div className="max-w-800 m-auto">
          <CustomQuoteForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
