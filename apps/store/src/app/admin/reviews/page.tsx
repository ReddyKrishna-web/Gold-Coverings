import type { Metadata } from "next";
import Link from "next/link";
import { Stars } from "@uma/ui";
import { prisma, type ReviewStatus } from "@uma/db";
import { setReviewStatusAction } from "@/app/actions/admin";
import { AdminEmpty, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reviews" };

const TABS: { label: string; value: string }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (TABS.find((tab) => tab.value === searchParams.status)?.value ??
    "PENDING") as ReviewStatus;

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.review.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (value: ReviewStatus) =>
    counts.find((entry) => entry.status === value)?._count ?? 0;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Trust"
        title="Reviews"
        description="Nothing is published until it is approved. Reject spam or personal information; keep honest feedback."
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews?status=${tab.value.toLowerCase()}`}
            className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] ${
              status === tab.value
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--gold-100)]"
                : "border-[rgba(122,90,18,0.2)] bg-[#fffdf7]"
            }`}
          >
            {tab.label} ({countFor(tab.value as ReviewStatus)})
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-4">
          <AdminEmpty
            title={`No ${status.toLowerCase()} reviews`}
            body="Product reviews and website testimonials submitted by customers will appear here."
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="admin-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={review.rating} size={12} />
                    <p className="text-sm font-medium text-[var(--ink)]">{review.name}</p>
                    <span className="badge badge-neutral">
                      {review.isTestimonial ? "Website testimonial" : "Product review"}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                    {review.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {review.product ? (
                      <>
                        {" · "}
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="underline underline-offset-2"
                        >
                          {review.product.name}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {status !== "APPROVED" ? (
                    <form action={setReviewStatusAction}>
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="status" value="APPROVED" />
                      <button
                        type="submit"
                        className="border border-[rgba(46,125,50,0.35)] bg-[#eef7ee] px-2.5 py-1.5 text-[0.56rem] uppercase tracking-[0.08em] text-[var(--success)]"
                      >
                        Approve
                      </button>
                    </form>
                  ) : null}
                  {status !== "REJECTED" ? (
                    <form action={setReviewStatusAction}>
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <button
                        type="submit"
                        className="border border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] px-2.5 py-1.5 text-[0.56rem] uppercase tracking-[0.08em] text-[var(--error)]"
                      >
                        Reject
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>

              {review.title ? (
                <h3 className="mt-3 font-display text-lg text-[var(--ink)]">{review.title}</h3>
              ) : null}
              <p className="mt-1 whitespace-pre-wrap text-sm font-light leading-relaxed text-[rgba(14,11,7,0.68)]">
                {review.body}
              </p>
              {review.email ? (
                <p className="mt-2 text-[0.6rem] text-[rgba(14,11,7,0.4)]">Contact: {review.email}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
