const parseNumber = (str) => {
  if (!str) return 0;
  return parseInt(str.replace(/,/g, ""), 10);
};

export default parseNumber;
