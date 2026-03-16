const MEMORIAL_ASSET_BASE_URL = 'https://assets.azadiroad.com';

export const getMemorialImagePath = (person) => {
  if (person?.image) return person.image;

  const year = new Date(person.died_at).getFullYear();
  return `${MEMORIAL_ASSET_BASE_URL}/${year}/${person.id}.webp`;
};
