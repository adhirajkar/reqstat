export const validateUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      
      // Check if it has a valid protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Check if hostname exists and is not just a single word
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return false;
      }
      
      // Check if hostname contains at least one dot (domain.tld)
      // or is localhost/IP address
      const isLocalhost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
      const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(urlObj.hostname);
      const hasDot = urlObj.hostname.includes('.');
      
      if (!isLocalhost && !isIP && !hasDot) {
        return false;
      }
      
      // Basic domain validation - should have at least 2 parts after splitting by dot
      if (!isLocalhost && !isIP) {
        const parts = urlObj.hostname.split('.');
        if (parts.length < 2 || parts.some(part => part.length === 0)) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  };