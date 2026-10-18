import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="container checkout-page-main">
        <div className="checkout-headline-block">
          <span className="eyebrow-luxury">SECURE ENCRYPTED CHECKOUT</span>
          <h1 className="serif-heading mt-10">Complete Your Mirror Order</h1>
          <p className="checkout-subhead">
            Your piece will be custom-inspected, packed in heavy-duty wooden crates, and dispatched with transit insurance.
          </p>
        </div>
        <CheckoutForm />
      </main>
      <Footer />
    </>
  );
}
