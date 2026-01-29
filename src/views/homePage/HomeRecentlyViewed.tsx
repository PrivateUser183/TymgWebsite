import { FC, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "@/components/Cards/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@heroui/react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const HomeRecentlyViewed: FC = () => {
  const { t } = useTranslation();
  const recentlyViewedProducts = useSelector(
    (state: RootState) => state.recentlyViewed.products
  );

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const slides = useMemo(
    () =>
      recentlyViewedProducts.map((product) => (
        <SwiperSlide key={product.id}>
          <div className="py-0.5">
            <ProductCard product={product} />
          </div>
        </SwiperSlide>
      )),
    [recentlyViewedProducts]
  );

  // Don't render section if no products
  if (recentlyViewedProducts.length === 0) {
    return null;
  }

  return (
    <section id="home-recently-viewed">
      <div className="w-full mb-4">
        <div className="flex justify-between w-full items-center mb-6">
          <SectionHeading
            title={t("home.recently_viewed.title")}
            description={t("home.recently_viewed.description")}
            icon={<Eye size={16} className="text-white" />}
          />
        </div>
        <div className="relative group">
          {/* Previous Button */}
          <Button
            isIconOnly
            ref={prevRef}
            size="sm"
            className="hidden sm:flex
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20
            bg-background border border-default-300 shadow-lg  disabled:opacity-50
            transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Previous"
            radius="lg"
          >
            <ChevronLeft size={20} className="text-default-700" />
          </Button>

          {/* Next Button */}
          <Button
            isIconOnly
            ref={nextRef}
            size="sm"
            className="hidden sm:flex
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20
            bg-background border border-default-300 shadow-lg  disabled:opacity-50
            transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110
          "
            aria-label="Next"
            radius="lg"
          >
            <ChevronRight size={20} className="text-default-700" />
          </Button>

          {/* Swiper */}
          <Swiper
            slidesPerView={2}
            spaceBetween={1}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 12 },
              1024: { slidesPerView: 4, spaceBetween: 12 },
              1280: { slidesPerView: 5, spaceBetween: 12 },
              1440: { slidesPerView: 7, spaceBetween: 12 },
            }}
            onBeforeInit={(swiper) => {
              const nav = swiper.params.navigation;
              if (nav && typeof nav !== "boolean") {
                nav.prevEl = prevRef.current;
                nav.nextEl = nextRef.current;
              }
            }}
            navigation={true}
            modules={[Navigation]}
            lazyPreloadPrevNext={0}
          >
            {slides}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HomeRecentlyViewed;
