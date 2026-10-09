import { useState } from "react";
import { Link } from "@/lib/router";

export type GridCategory = {
  id: string;
  name: string;
  productCount: number;
  isFeatured: boolean;
};

export function CategoryGrid({
  categories,
  labels,
}: {
  categories: GridCategory[];
  labels: { all: string; hide: string; products: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const featured = categories.filter((category) => category.isFeatured);
  const rest = categories.filter((category) => !category.isFeatured);
  const visible = expanded ? categories : (featured.length > 0 ? featured : categories.slice(0, 8));

  return (
    <div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((category) => (
          <li key={category.id}>
            <Link
              href={`/category/?id=${encodeURIComponent(category.id)}`}
              className="flex h-full min-h-[92px] flex-col justify-between rounded-[4px] border border-line bg-white p-3.5 transition-all hover:border-graphite hover:shadow-sm md:min-h-[104px] md:p-4"
            >
              <span className="text-[16px] font-bold leading-snug text-ink md:text-[18px]">
                {category.name}
              </span>
              <span className="mt-2 flex items-center justify-between text-[14px] text-muted">
                <span>
                  {category.productCount} {labels.products}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {categories.length > visible.length && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="ms-btn ms-btn-outline mt-4 w-full text-[15px] sm:w-auto"
        >
          {labels.all}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}

      {expanded && categories.length > 8 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="ms-btn ms-btn-outline mt-4 w-full text-[15px] sm:w-auto"
        >
          {labels.hide}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
