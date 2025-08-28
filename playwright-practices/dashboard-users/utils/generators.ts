const generateUniqueString = (length = 6): string =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length);

type RandomType = 'email' | 'username';

export const generateRandom = (type: RandomType, prefix = 'user'): string => {
  const unique = generateUniqueString();
  if (type === 'email') return `${prefix}.${unique}@example.com`;

  return `${prefix}_${unique}`;
};
