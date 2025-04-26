import { debounce } from 'lodash';

// Add debounced navigation function
const debouncedNavigate = debounce((navigate, path) => {
  navigate(path, { replace: true });
}, 300); // 300ms delay

export const handleAuthNavigation = (isAuthenticated, navigate) => {
  if (!isAuthenticated) {
    debouncedNavigate(navigate, '/login');
    return false;
  }
  return true;
}; 