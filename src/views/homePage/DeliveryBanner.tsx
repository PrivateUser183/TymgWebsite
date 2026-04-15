import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Button, Image } from "@heroui/react";
import { ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/router";

const DeliveryBanner: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <section id="delivery-banner" className="my-7">
      <div className="w-full relative overflow-visible">
        {/* Main Banner Card */}
        <Card className="relative overflow-visible bg-linear-to-br from-primary to-primary-600 shadow-2xl border-none">
          <CardBody className="relative z-10 p-0 overflow-visible">
            <div className="grid grid-cols-12 min-h-[200px] relative">
              {/* Content Section */}
              <div className="col-span-12 lg:col-span-7 p-4 lg:p-8 flex flex-col justify-center space-y-5">
                {/* Header with icon */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <span className="text-xs sm:text-sm font-medium">
                      {t("home.delivery.header")}
                    </span>
                  </div>
                </div>

                {/* Main Title */}
                <div>
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {t("home.delivery.title")}
                    <span className="ml-2 bg-linear-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent inline-block">
                      {t("home.delivery.highlight")}
                    </span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-xs sm:text-lg text-white/90 font-medium">
                  {t("home.delivery.subtitle")}
                </p>

                {/* CTA Button */}
                <div>
                  <Button
                    className="font-semibold bg-white text-black/80 px-4 py-3 text-medium sm:px-8 sm:py-6 sm:text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    startContent={
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    }
                    onPress={() => {
                      router.push("/products");
                    }}
                    radius="full"
                  >
                    {t("home.delivery.button")}
                  </Button>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-2 text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xxs sm:text-sm">
                      {t("home.delivery.features.tracking")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xxs sm:text-sm">
                      {t("home.delivery.features.packaging")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-xxs sm:text-sm">
                      {t("home.delivery.features.contact_free")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="col-span-12 lg:col-span-5 relative flex items-center justify-center lg:justify-end">
                <div className="relative z-20 lg:absolute lg:-right-8 lg:-top-8">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-linear-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl scale-110"></div>

                    {/* Main delivery image */}
                    <Image
                      src="/images/delivery-boy-blue.png"
                      alt="Delivery person"
                      className="relative z-10 w-56 h-60 sm:w-72 sm:h-80 lg:w-80 lg:h-96 object-cover drop-shadow-2xl"
                      radius="lg"
                      classNames={{
                        img: "hover:scale-105 transition-transform duration-500",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardBody>

          {/* Decorative wave */}
          <div className="absolute -bottom-3 left-0 right-0 h-16 overflow-hidden">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="relative block w-full h-full"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                fill="rgba(255,255,255,0.1)"
              />
            </svg>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DeliveryBanner;
