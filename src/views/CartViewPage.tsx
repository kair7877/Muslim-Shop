import { CartView } from "@/components/CartView";
import { useLanguage } from "@/components/ClientProviders";

export function CartViewPage() {
  const { lang, dict } = useLanguage();
  return (
    <div className="ms-container py-6 md:py-8">
      <h1 className="text-[26px] font-black uppercase md:text-[34px]">{dict.cart}</h1>
      <div className="mt-6">
        <CartView
          labels={{
            empty: dict.cartEmpty,
            emptyHint: dict.cartEmptyHint,
            goCatalog: dict.goCatalog,
            quantity: dict.quantity,
            remove: dict.remove,
            total: dict.total,
            checkout: dict.checkout,
            continue: dict.continueShopping,
            sum: dict.sum,
            title: dict.orderTitle,
            note:
              lang === "kz"
                ? "Менеджер тапсырысты растайды және жеткізуді нақтылайды."
                : "Менеджер свяжется с вами и подтвердит заказ.",
          }}
        />
      </div>
    </div>
  );
}
