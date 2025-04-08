import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Airdrops.geo - Best Crypto Airdrops Platform | Find & Claim Free Tokens',
  description = 'Discover the latest crypto airdrops and claim free tokens. Track upcoming, active, and popular cryptocurrency airdrops all in one place. Updated daily.',
  canonicalUrl,
  ogImage = '/og-image.jpg',
  keywords = 'crypto airdrops, airdrops, cryptocurrency airdrops, free crypto, free tokens, blockchain airdrops, claim airdrops, best airdrops, upcoming airdrops, active airdrops',
  type = 'website',
  children
}) => {
  const siteUrl = window.location.origin;
  const url = canonicalUrl ? `${siteUrl}${canonicalUrl}` : window.location.href;

  // Default structured data for website
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Airdrops.geo",
    "url": siteUrl,
    "description": "Discover and claim the latest crypto airdrops and free tokens",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Airdrops.geo" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="revisit-after" content="1 day" />
      <meta name="author" content="Airdrops.geo" />

      {/* JSON-LD Structured Data */}
      {!children && (
        <script type="application/ld+json">
          {JSON.stringify(defaultStructuredData)}
        </script>
      )}
      {children}
    </Helmet>
  );
};

export default SEO;
