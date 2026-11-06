import type { Metadata } from "next";
import ScrollNumberEditorialLayout, { PolicySection } from "@/components/ScrollNumberEditorialLayout";

export const metadata: Metadata = {
  title: "Refund Policy | PROMEC",
  description:
    "Learn about PROMEC's Refund Policy, eligibility conditions, process for damaged or incorrect products, warranty registration, claims & replacements, and refund timelines.",
};

const preamble = (
  <p>
    At PROMEC, we aim to provide reliable products and a smooth purchasing experience. This Refund Policy explains when a customer may be eligible for a refund and how refunds are processed.
  </p>
);

const sections: PolicySection[] = [
  {
    id: "section-01",
    number: "01",
    title: "Eligibility for Refund",
    category: "ELIGIBILITY CRITERIA",
    content: (
      <>
        <p>A customer may be eligible for a refund in situations including:</p>
        <ul className="space-y-2 pt-1">
          {[
            "Order cancelled by PROMEC due to product unavailability or other valid reasons.",
            "Product received is incorrect or materially different from what was ordered.",
            "Product is received damaged and the issue is reported within the applicable reporting period.",
            "Product has a manufacturing defect covered under the applicable return/refund terms.",
            "Refund is otherwise required under applicable law or PROMEC’s applicable product policy.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "section-02",
    number: "02",
    title: "Damaged or Incorrect Product",
    category: "REPORTING & INSPECTION",
    content: (
      <>
        <p>
          If you receive a damaged, incorrect or materially defective product, please contact our support team as soon as possible after delivery.
        </p>
        <p className="font-semibold text-black">You may be asked to provide:</p>
        <ul className="space-y-2 pt-1">
          {[
            "Order number",
            "Photographs of the package and product",
            "Unboxing video, where available",
            "Photographs/videos showing the issue",
            "Other information required to verify the claim",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="pt-2">
          Our team may inspect or verify the issue before approving a return or refund.
        </p>
      </>
    ),
  },
  {
    id: "section-03",
    number: "03",
    title: "Products Not Eligible for Refund",
    category: "EXCLUSIONS",
    content: (
      <>
        <p className="font-semibold text-black">
          Refunds may not be provided where the issue is caused by:
        </p>
        <ul className="space-y-2 pt-1">
          {[
            "Misuse or improper use of the product",
            "Accidental damage",
            "Physical damage caused after delivery",
            "Scratches or cosmetic damage caused by the customer",
            "Unauthorised modification or repair",
            "Failure to follow product instructions",
            "Normal wear and tear",
            "Damage caused by improper storage or handling",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="pt-2 text-neutral-600">
          Warranty/service support may still be available where applicable.
        </p>
      </>
    ),
  },
  {
    id: "section-04",
    number: "04",
    title: "Refund Process",
    category: "SETTLEMENT & PAYMENT",
    content: (
      <>
        <p>
          Once a refund is approved, PROMEC will initiate the refund to the original payment method or through another appropriate method, depending on the payment channel used.
        </p>
        <p>
          The time taken for the amount to reflect in the customer’s account may depend on the payment gateway, bank or financial institution.
        </p>
      </>
    ),
  },
  {
    id: "section-05",
    number: "05",
    title: "Partial COD / Advance Payments",
    category: "PARTIAL ORDERS",
    content: (
      <p>
        Where an order involves an advance or partial payment, the refundable amount, if applicable, will be determined based on the reason for cancellation/return and the applicable policy.
      </p>
    ),
  },
  {
    id: "section-06",
    number: "06",
    title: "Non-Delivery / Failed Delivery",
    category: "LOGISTICS ISSUES",
    content: (
      <>
        <p>
          If an order cannot be delivered due to an incorrect address, repeated delivery failure, customer unavailability or refusal to accept the shipment, PROMEC may process the order according to the applicable cancellation and return-to-origin procedures.
        </p>
        <p>
          Any refund, where applicable, will be subject to the relevant order terms and applicable charges.
        </p>
      </>
    ),
  },
  {
    id: "section-07",
    number: "07",
    title: "Warranty vs Refund",
    category: "SERVICE VS SETTLEMENT",
    content: (
      <>
        <p>
          A product issue covered under warranty does not automatically mean that the customer is entitled to a refund.
        </p>
        <p>
          Depending on the nature of the issue and applicable policy, PROMEC may provide troubleshooting, repair, replacement, spare parts or other appropriate warranty support.
        </p>
      </>
    ),
  },
  {
    id: "section-08",
    number: "08",
    title: "Warranty Registration, Claims & Replacements",
    category: "WARRANTY & REPLACEMENTS",
    content: (
      <>
        <p>
          To ensure a smooth warranty claim or replacement process, customers are requested to provide the following:
        </p>
        <div className="space-y-4 pt-1">
          {[
            {
              step: "1",
              title: "Unboxing Video",
              description:
                "Record a clear, continuous video while unboxing the AquaForce washer system and its accessories.",
            },
            {
              step: "2",
              title: "Product Testing Video",
              description:
                "Record a video showing the washer system being tested along with the vacuum cleaner.",
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 sm:gap-4">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-black leading-tight">{item.title}</p>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "section-09",
    number: "09",
    title: "Contact Us",
    category: "REFUND & RETURN INQUIRIES",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-700">
          For refund or return-related queries, please contact:
        </p>

        <div className="border border-black/15 p-6 sm:p-8 space-y-4 font-mono text-xs sm:text-sm bg-neutral-50">
          <div className="text-base sm:text-lg font-bold font-montserrat tracking-tight text-black uppercase">
            PROMEC
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-black/10 pt-3">
            <span className="text-neutral-500 uppercase tracking-widest text-[11px]">Email</span>
            <a
              href="mailto:promec.india@gmail.com"
              className="text-black hover:underline underline-offset-4 font-sans text-sm font-medium"
            >
              promec.india@gmail.com
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-black/10 pt-3">
            <span className="text-neutral-500 uppercase tracking-widest text-[11px]">Phone / WhatsApp</span>
            <a
              href="tel:+917387588963"
              className="text-black hover:underline underline-offset-4 font-sans text-sm font-medium"
            >
              +91 73875 88963
            </a>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-2 border-t border-black/10 pt-3">
            <span className="text-neutral-500 uppercase tracking-widest text-[11px] shrink-0">Address</span>
            <span className="text-neutral-700 font-sans text-xs sm:text-sm text-left sm:text-right max-w-md leading-relaxed">
              13A, Plot No. 5A, beside Tata Motors Service Centre, M.I.D.C, MIDC, Hingna, Digdoh, Maharashtra 440016
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <ScrollNumberEditorialLayout
      pageTitle="REFUND POLICY"
      metadataLabel="LEGAL DOCUMENT"
      lastUpdated="MARCH 2026"
      preamble={preamble}
      sections={sections}
    />
  );
}
