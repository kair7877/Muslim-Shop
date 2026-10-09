import { CheckoutForm } from "@/components/CheckoutForm";
import { useLanguage } from "@/components/ClientProviders";

export function CheckoutView() {
  const { lang, dict } = useLanguage();
  return (
    <div className="ms-container py-6 md:py-8">
      <h1 className="text-[26px] font-black uppercase md:text-[34px]">{dict.orderTitle}</h1>
      <div className="mt-6">
        <CheckoutForm
          labels={{
            name: dict.yourName,
            phone: dict.yourPhone,
            city: dict.city,
            delivery: dict.delivery,
            pickup: dict.pickup,
            courier: dict.courier,
            address: dict.address,
            addressHint: dict.addressHint,
            comment: dict.comment,
            commentHint: dict.commentHint,
            confirm: dict.confirmOrder,
            total: dict.total,
            cartTitle: dict.cart,
            error: dict.somethingWrong,
            itemsWord: lang === "kz" ? "өнім" : "товаров",
            emptyCart: dict.cartEmpty,
            goCatalog: dict.goCatalog,
          }}
        />
      </div>
    </div>
  );
}
