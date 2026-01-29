import { FC, useState, useMemo } from "react";
import { CartItem } from "@/types/ApiResponse";
import { addToast, Button, Chip, Divider, Image } from "@heroui/react";
import Link from "next/link";
import { CheckCircle, Trash2, XCircle, Bookmark } from "lucide-react";
import CartQuantityControl from "@/components/CartQuantityControl";
import { removeItemFromCart, saveCartItemToSaveForLater } from "@/routes/api";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { updateCartData } from "@/helpers/updators";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useTranslation } from "react-i18next";
import Lightbox from "yet-another-react-lightbox";
import { mutate } from "swr";
import { useSettings } from "@/contexts/SettingsContext";

interface CartItemsProps {
  items: CartItem[];
  currencySymbol: string;
}

const CartItems: FC<CartItemsProps> = ({ items = [], currencySymbol = "" }) => {
  const { t } = useTranslation();
  const { systemSettings } = useSettings();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const isLoading = useSelector((state: RootState) => state.cart.isLoading);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string }[]>([]);

  const lowStockLimit = Number(systemSettings?.lowStockLimit || 0) || null;

  // Group items by store
  const groupedItems = useMemo(() => {
    const grouped = items.reduce(
      (acc, item) => {
        const storeId = item.store.id;
        if (!acc[storeId]) {
          acc[storeId] = {
            store: item.store,
            items: [],
          };
        }
        acc[storeId].items.push(item);
        return acc;
      },
      {} as Record<number, { store: CartItem["store"]; items: CartItem[] }>
    );

    return Object.values(grouped);
  }, [items]);

  const handleRemoveItem = async () => {
    if (!selectedItemId) return;

    try {
      const response = await removeItemFromCart(selectedItemId);
      if (response.success) {
        addToast({
          title: t("cartItems.itemRemoved.title"),
          description: t("cartItems.itemRemoved.description"),
          color: "success",
        });
      } else {
        addToast({
          title: t("cartItems.removeFailed.title"),
          description:
            response.message || t("cartItems.removeFailed.description"),
          color: "danger",
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        title: t("cartItems.networkError.title"),
        description: t("cartItems.networkError.description"),
        color: "danger",
      });
    } finally {
      setSelectedItemId(null);
      await updateCartData(true, true);
      document.getElementById("refetch-similar-products")?.click();
    }
  };

  // Placeholder for "Save for Later"
  const handleSaveForLater = async (itemId: number, quantity: number) => {
    try {
      const res = await saveCartItemToSaveForLater(itemId, quantity);
      if (res.success) {
        mutate("/save-for-later");
        updateCartData(true, false);
        addToast({
          title: t("saveForLater.movedMessage"),
          color: "success",
        });
      } else {
        addToast({
          title: t("saveForLater.errorMessage"),
          color: "success",
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        title: t("cartItems.networkError.title"),
        description: t("cartItems.networkError.description"),
        color: "danger",
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {groupedItems.length > 0 &&
        groupedItems.map((group) => (
          <div
            key={group.store.id}
            className="bg-default-50 rounded-lg p-4 border border-default-200"
          >
            {/* Store Header */}
            <div className="mb-4 pb-3 border-b border-default-200 flex gap-1 w-full justify-between">
              <div className="flex gap-1">
                <span className="text-sm text-foreground inline-flex items-center gap-1">
                  {t("cartItems.from")}:
                </span>
                <Link
                  href={`/stores/${group.store.slug}`}
                  className="text-sm font-semibold text-foreground inline-flex items-center gap-1"
                  title={group.store.name}
                >
                  {group.store.name}
                </Link>
              </div>

              <Chip
                variant="flat"
                color={group.store.status.is_open ? "success" : "danger"}
                radius="full"
                size="sm"
                startContent={
                  group.store.status.is_open ? (
                    <CheckCircle size={12} />
                  ) : (
                    <XCircle size={12} />
                  )
                }
                className="font-medium text-xs px-2"
              >
                {group.store.status.is_open
                  ? t("soldBySection.open")
                  : t("soldBySection.closed")}
              </Chip>
            </div>

            {/* Items in this store */}
            <div className="flex flex-col gap-3">
              {group.items.map((item, itemIndex) => {
                const isLowStock =
                  lowStockLimit !== null &&
                  item.variant.stock > 0 &&
                  item.variant.stock <= lowStockLimit;

                return (
                  <div key={item.id}>
                    <div className="flex items-start space-x-3 py-2">
                      <div className="w-[25%] flex justify-center object-contain">
                        <Image
                          loading="lazy"
                          src={item.product.image}
                          alt={item.variant.title || ""}
                          className="w-full h-16 object-cover rounded-md cursor-pointer"
                          onClick={() => {
                            setLightboxImages([{ src: item.product.image }]);
                            setLightboxOpen(true);
                          }}
                        />
                      </div>

                      <div className="w-[65%] flex flex-col gap-1">
                        <h3 className="font-medium text-sm">
                          <Link
                            title={item.product.name || ""}
                            href={`/products/${item.product.slug}`}
                            className="block truncate overflow-hidden text-ellipsis max-w-full"
                          >
                            {item.product.name}
                          </Link>

                          {/* VARIANT NAME & LOW STOCK INDICATOR */}
                          {item.variant?.title && (
                            <div className="text-xs text-foreground/50 flex flex-wrap gap-2 items-center mt-1">
                              <span className="max-w-24 truncate block">
                                {item.variant.title}
                              </span>
                              {isLowStock && (
                                <span className="text-orange-500 font-semibold text-xxs bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                                  {t("product_modal.low_stock_alert", {
                                    stock: item.variant.stock,
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </h3>

                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-xs text-foreground/60">
                            {currencySymbol}{" "}
                            {item.variant.special_price &&
                            item.variant.special_price !== 0 ? (
                              <>
                                <span className="line-through opacity-60">
                                  {item.variant.price}
                                </span>{" "}
                                {item.variant.special_price}
                              </>
                            ) : (
                              item.variant.price
                            )}{" "}
                            × {item.quantity}
                          </span>

                          <CartQuantityControl
                            item={item}
                            maxQuantity={item.product.total_allowed_quantity}
                            minQuantity={item.product.minimum_order_quantity}
                            quantityStep={item.product.quantity_step_size}
                            stock={item.variant.stock}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center -mt-2">
                        <Button
                          title={t("saveForLater.title")}
                          className="p-0 bg-transparent"
                          size="sm"
                          isDisabled={isLoading}
                          isIconOnly
                          startContent={
                            <Bookmark size={16} className="text-primary-500" />
                          }
                          onPress={() =>
                            handleSaveForLater(item.id, item.quantity)
                          }
                        />
                        <Button
                          title={t("remove_item")}
                          className="p-0 bg-transparent"
                          size="sm"
                          isDisabled={isLoading}
                          isIconOnly
                          startContent={
                            <Trash2 size={16} className="text-danger-500" />
                          }
                          onPress={() => setSelectedItemId(item.id)}
                        />
                      </div>
                    </div>

                    {itemIndex < group.items.length - 1 && (
                      <Divider className="my-2" orientation="horizontal" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      <ConfirmationModal
        isOpen={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
        onConfirm={handleRemoveItem}
        title={t("cartItems.removeItemModal.title")}
        icon={<Trash2 className="w-4 h-4" />}
        description={t("cartItems.removeItemModal.description")}
        confirmText={t("cartItems.removeItemModal.confirmText")}
        cancelText={t("cartItems.removeItemModal.cancelText")}
        variant="danger"
        alertTitle={t("cartItems.removeItemModal.alertTitle")}
        alertDescription={t("cartItems.removeItemModal.alertDescription")}
      />
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
      />
    </div>
  );
};

export default CartItems;
