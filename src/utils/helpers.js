export const uid = () => '_' + Math.random().toString(36).substring(2, 11);

export const getWhatsAppLink = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.substring(1);
  }
  return `https://wa.me/${cleaned}`;
};
