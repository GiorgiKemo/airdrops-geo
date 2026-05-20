import { Link, useLocation } from 'react-router-dom';

// Custom link component that scrolls to top on click
const ScrollLink = ({ to, children, className, onClick, ...props }) => {
  const location = useLocation();
  
  const handleClick = (e) => {
    onClick?.(e);

    if (e.defaultPrevented) {
      return;
    }

    if (location.pathname === to) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  };

  return (
    <Link 
      to={to} 
      className={className} 
      {...props}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default ScrollLink;
