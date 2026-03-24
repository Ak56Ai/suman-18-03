import { useEffect } from "react";

const ProductSchema = ({ product }: any) => {
  useEffect(() => {
    if (!product) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",

      name: product.name,
      description: product.description,

      image: product.images?.length
        ? product.images
        : [product.image_url],

      brand: {
        "@type": "Brand",
        name: product.brand || "Pansarika",
      },

      sku: product.id,

      offers: {
        "@type": "Offer",
        url: window.location.href,
        priceCurrency: "USD",
        price: product.price,
        priceValidUntil: "2026-12-31",

        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        itemCondition: "https://schema.org/NewCondition",
      },

      aggregateRating:
        product.rating_average && product.rating_count
          ? {
              "@type": "AggregateRating",
              ratingValue: product.rating_average,
              reviewCount: product.rating_count,
            }
          : undefined,

      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Category",
          value: product.category,
        },
        {
          "@type": "PropertyValue",
          name: "Size",
          value: product.size,
        },
        {
          "@type": "PropertyValue",
          name: "Country of Origin",
          value: product.country_of_origin,
        },
        {
          "@type": "PropertyValue",
          name: "Shelf Life",
          value: product.shelf_life,
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schema);

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  return null;
};

export default ProductSchema;