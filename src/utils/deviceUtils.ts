export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile|mobile/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  // Check screen width as fallback
  const isSmallScreen = window.innerWidth <= 1024;
  
  return isMobile || isTablet || isSmallScreen;
};

// Handle banner click based on device type
export const handleBannerClick = (
  buttonLink: string | undefined,
  productId?: string
) => {
  if (!buttonLink) return;
  
  // Determine if we should open in new tab
  const isMobile = isMobileDevice();
  
  // If mobile, open in same window (like mobile app)
  if (isMobile) {
    window.location.href = buttonLink;
  } else {
    // If desktop, open in new tab
    window.open(buttonLink, '_blank', 'noopener,noreferrer');
  }
};