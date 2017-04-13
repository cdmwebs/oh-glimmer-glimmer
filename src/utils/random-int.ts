const getRandomInt = (min: number = 0, max: number = 10) => {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;

  return Math.floor(Math.random() * (max - min)) + min;
};

export default getRandomInt;
