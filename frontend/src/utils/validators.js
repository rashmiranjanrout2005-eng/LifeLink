export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isRequired = (value) => String(value || '').trim().length > 0;
