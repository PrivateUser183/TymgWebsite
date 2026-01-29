import { useState } from "react";
import PageHeader from "@/components/custom/PageHeader";
import HTMLRenderer from "@/components/Functional/HTMLRenderer";
import { Product } from "@/types/ApiResponse";
import { useTranslation } from "react-i18next";

interface AdditionalDetailSectionProps {
  initialProduct: Product;
}

const AdditionalDetailSection: React.FC<AdditionalDetailSectionProps> = ({
  initialProduct,
}) => {
  const { description = "" } = initialProduct || {};
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const shouldClamp = !expanded;
  const collapsedLines = 4;

  return (
    <section className="mt-4">
      <PageHeader
        title="Additional Details"
        subtitle="Find the additional info of the Product"
      />

      {/* Content */}
      <div
        className={shouldClamp ? `relative overflow-hidden` : undefined}
        style={
          shouldClamp
            ? {
                display: "-webkit-box",
                WebkitLineClamp: collapsedLines,
                WebkitBoxOrient: "vertical",
              }
            : undefined
        }
      >
        <HTMLRenderer html={description} />
      </div>

      {/* Show More / Less */}
      {description && (
        <button
          type="button"
          title={expanded ? t("see_less") : t("see_more")}
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-medium text-primary cursor-pointer"
        >
          {expanded ? t("see_less") : t("see_more")}
        </button>
      )}
    </section>
  );
};

export default AdditionalDetailSection;
