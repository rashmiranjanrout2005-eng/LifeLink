const authRedirectKey = 'lifelink.authRedirect';

export function getUserHomePath(user) {
  const role = user?.app_metadata?.role || user?.user_metadata?.role || 'donor';
  if (role === 'admin') return '/admin';
  if (role === 'hospital') return '/hospital/request-blood';
  if (role === 'patient') return '/hospital/request-blood';
  return '/become-donor';
}

export function getPostAuthPath(user, requestedPath) {
  if (typeof requestedPath === 'string' && requestedPath.startsWith('/') && !requestedPath.startsWith('//')) {
    return requestedPath;
  }
  return getUserHomePath(user);
}

export function saveAuthRedirect(path) {
  if (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) {
    window.sessionStorage.setItem(authRedirectKey, path);
  } else {
    window.sessionStorage.removeItem(authRedirectKey);
  }
}

export function consumeAuthRedirect(user) {
  const requestedPath = window.sessionStorage.getItem(authRedirectKey);
  window.sessionStorage.removeItem(authRedirectKey);
  return getPostAuthPath(user, requestedPath);
}
