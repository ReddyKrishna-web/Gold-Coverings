import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@uma/db";
import { markEnquiryAction } from "@/app/actions/admin";
import { AdminEmpty, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Enquiries" };

function waLink(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(`Hello ${name}, this is Krishna Jewellers responding to your website enquiry.`);
  return `https://wa.me/${digits}?text=${text}`;
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const showHandled = searchParams.status === "handled";
  const enquiries = await prisma.enquiry.findMany({
    where: { status: showHandled ? "HANDLED" : "NEW" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const [newCount, handledCount] = await Promise.all([
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.enquiry.count({ where: { status: "HANDLED" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Customer care"
        title="Enquiries"
        description="Messages sent through the brand website land here in real time — the same database powers both deployments."
      />

      <div className="mt-5 flex gap-2">
        <Link
          href="/admin/enquiries"
          className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] ${
            !showHandled
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--gold-100)]"
              : "border-[rgba(122,90,18,0.2)] bg-[#fffdf7]"
          }`}
        >
          New ({newCount})
        </Link>
        <Link
          href="/admin/enquiries?status=handled"
          className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] ${
            showHandled
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--gold-100)]"
              : "border-[rgba(122,90,18,0.2)] bg-[#fffdf7]"
          }`}
        >
          Handled ({handledCount})
        </Link>
      </div>

      {enquiries.length === 0 ? (
        <div className="mt-4">
          <AdminEmpty
            title={showHandled ? "No handled enquiries" : "No new enquiries"}
            body={
              showHandled
                ? "Enquiries you mark as handled will be listed here."
                : "New messages from the website enquiry form will appear here."
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="admin-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[var(--ink)]">{enquiry.name}</p>
                    <span className={`badge ${enquiry.status === "NEW" ? "badge-pending" : "badge-neutral"}`}>
                      {enquiry.status.toLowerCase()}
                    </span>
                    {enquiry.interest ? (
                      <span className="text-[0.58rem] uppercase tracking-[0.1em] text-[var(--gold-700)]">
                        {enquiry.interest}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                    {enquiry.createdAt.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    · via {enquiry.source}
                  </p>
                </div>
                <form action={markEnquiryAction}>
                  <input type="hidden" name="id" value={enquiry.id} />
                  <input type="hidden" name="action" value={showHandled ? "new" : "handled"} />
                  <button
                    type="submit"
                    className="border border-[rgba(122,90,18,0.22)] px-2.5 py-1.5 text-[0.56rem] uppercase tracking-[0.08em] hover:bg-[rgba(212,175,55,0.1)]"
                  >
                    {showHandled ? "Reopen" : "Mark handled"}
                  </button>
                </form>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm font-light leading-relaxed text-[rgba(14,11,7,0.68)]">
                {enquiry.message}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 border-t border-[rgba(122,90,18,0.1)] pt-3 text-[0.62rem]">
                <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1.5 text-[var(--gold-900)]">
                  <Phone size={12} aria-hidden="true" /> {enquiry.phone}
                </a>
                <a
                  href={waLink(enquiry.phone, enquiry.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--gold-900)]"
                >
                  <MessageCircle size={12} aria-hidden="true" /> WhatsApp
                </a>
                {enquiry.email ? (
                  <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1.5 break-all text-[rgba(14,11,7,0.55)]">
                    <Mail size={12} aria-hidden="true" /> {enquiry.email}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
