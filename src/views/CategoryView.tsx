import { useSearchParams } from "@/lib/router";
import { StaticCatalog } from "@/components/StaticCatalog";

export function CategoryView() {
  const params = useSearchParams();
  const catId = params.get("id") ?? "";
  return <StaticCatalog fixedCategoryId={catId} />;
}
