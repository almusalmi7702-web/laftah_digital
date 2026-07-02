export const sanitizeSlug = (slug: string): string => {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
};

export const generateSlug = (prefix: string, title: string): string => {
  const sanitized = sanitizeSlug(title);
  if (sanitized) return sanitized;
  return `${prefix}-${Date.now()}`;
};
