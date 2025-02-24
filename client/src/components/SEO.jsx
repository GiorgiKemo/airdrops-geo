import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Airdrops.geo - Cryptocurrency Airdrops',
  description = 'Discover the latest cryptocurrency airdrops. Claim free tokens and participate in exciting crypto projects.',
  canonicalUrl,
  ogImage = '/og-image.jpg',
  keywords = 'cryptocurrency, airdrops, crypto, tokens, blockchain, free tokens',
  type = 'website'
}) => {
  const siteUrl = window.location.origin;
  const url = canonicalUrl ? `${siteUrl}${canonicalUrl}` : window.location.href;
  
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
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
    </Helmet>
  );
};

export default SEO;
