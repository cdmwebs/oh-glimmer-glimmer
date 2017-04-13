import getRandomInt from './random-int';

const COLORS = {
  0: {style: 'background: #EFEFEF;'},
  1: {style: 'background: #65E560;'},
  2: {style: 'background: #47C541;'},
  3: {style: 'background: #30A82A;'},
  4: {style: 'background: #288B24;'},
  5: {style: 'background: #288B24;'},
  6: {style: 'background: #8AFF87;'},
};

const getRandomColor = (min: number = 0, max: number = 10) => {
  return COLORS[getRandomInt(min, max)];
};

export default getRandomColor;
