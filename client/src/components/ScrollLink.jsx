import { Link, useLocation } from 'react-router-dom';

// Custom link component that scrolls to top on click
const ScrollLink = ({ to, children, className, ...props }) => {
  const location = useLocation();
  
  const handleClick = (e) => {
    // If we're already on this page, prevent default navigation
    // and just scroll to top
    if (location.pathname === to) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise, let the Link component handle navigation
    // (ScrollToTop component will handle the scrolling)
  };

  return (
    <Link 
      to={to} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default ScrollLink;
