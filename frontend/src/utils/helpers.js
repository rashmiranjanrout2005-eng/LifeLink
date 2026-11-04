export const classNames = (...items) => items.filter(Boolean).join(' ');
export const getInitials = (name = '') => name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
