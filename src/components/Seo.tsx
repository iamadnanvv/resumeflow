import { Helmet } from "react-helmet-async";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE, canonical } from "@/lib/site";

type Props = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
};

export function Seo({
  title,
  description,
  path,
  image = `${SITE_URL}/og-image.jpg`,
  type = "website",
  jsonLd,
  noindex,
}: Props) {
  const url = canonical(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const absImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const ldArr = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1"}
      />

      {/* Open Graph — Facebook, LinkedIn, Slack all read these */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absImage} />
      <meta property="og:image:secure_url" content={absImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_US" />

      {/* LinkedIn-specific */}
      <meta property="article:author" content="Muhammed Adnan Vv" />
      <meta name="author" content="Muhammed Adnan Vv" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Slack uses og:* primarily; this hint encourages large unfurl */}
      <meta name="slack-app-id" content="" />

      {/* Verification placeholders — replace values when codes are issued */}
      <meta name="google-site-verification" content="" />
      <meta name="msvalidate.01" content="" />
      <meta name="yandex-verification" content="" />
      <meta name="facebook-domain-verification" content="" />
      <meta name="p:domain_verify" content="" />

      {ldArr.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}