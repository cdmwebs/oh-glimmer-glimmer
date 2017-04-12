import Component, {tracked} from "@glimmer/component";
import ImagePixelExtractor from './image-pixel-extractor';

const MODE_DEFAULT = 'default';
const MODE_MAGIC = 'magic';

const STATE_PLAYING = 'playing';
const STATE_PAUSED = 'paused';

const LOWER_UPDATE_INTERVAL = 2;
const UPPER_UPDATE_INTERVAL = 1024;

const COLORS = {
  0: {style: 'background: #EFEFEF;'},
  1: {style: 'background: #65E560;'},
  2: {style: 'background: #47C541;'},
  3: {style: 'background: #30A82A;'},
  4: {style: 'background: #288B24;'},
  5: {style: 'background: #288B24;'},
  6: {style: 'background: #8AFF87;'},
};

const getRandomInt = (min: number = 0, max: number = 10) => {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;

  return Math.floor(Math.random() * (max - min)) + min;
};

export default class OhGlimmerGlimmer extends Component {
  private intervalId: number;
  private initialized: boolean;
  private imagePath: string;

  @tracked rows: Array<string>;
  @tracked columns: Array<string>;
  @tracked mode: string;
  @tracked state: string;
  @tracked framePerSecond: number;
  @tracked updateAtOnceAmount: number;
  @tracked data: Array<any>;

  @tracked('state')
  get isPlaying() {
    return this.state === STATE_PLAYING;
  }

  @tracked('mode')
  get isDefaultMode() {
    return this.mode === MODE_DEFAULT;
  }

  constructor(options) {
    super(options);

    this.mode = MODE_DEFAULT;
    this.initialized = false;
    this.intervalId = null;
    this.rows = Array(40).fill(0);
    this.columns = Array(150).fill(0);
    this.state = STATE_PAUSED;
    this.framePerSecond = 60;
    this.updateAtOnceAmount = 40;
    this.imagePath = 'glimmer_text_40.png';
  }

  private setupInterval() {
    this.intervalId = setInterval(() => requestAnimationFrame(() => this.update()), 1000 / this.framePerSecond);
  }

  private update() {
    let data: Array<any> = this.data || [];
    let currentRandomDay: number = getRandomInt(0, this.rows.length);
    let currentRandomMonth: Array<number> = Array(this.updateAtOnceAmount).fill(0).map(() => getRandomInt(0, this.columns.length));

    this.rows.forEach((row, rowIndex) => {
      if (this.initialized && currentRandomDay !== rowIndex) {
        return;
      }

      if (!data[rowIndex]) {
        data[rowIndex] = [];
      }

      this.columns.forEach((column, columnIndex) => {
        if (this.initialized && currentRandomMonth.indexOf(columnIndex) === -1) {
          return;
        }

        if (!data[rowIndex][columnIndex]) {
          data[rowIndex][columnIndex] = [];
        }

        if (this.mode === MODE_MAGIC) {
          let _item = data[rowIndex][columnIndex];
          let {r, g, b, a, direction, ignore} = _item;

          if (ignore) {
            return;
          }

          if (a <= 0.2) {
            direction = 'up';
          } else if (a >= 1) {
            direction = 'down';
          }

          a = direction === 'up' ? a + 0.2 : a - 0.2;

          data[rowIndex][columnIndex] = Object.assign(_item, {
            style: `background: rgba(${r}, ${g}, ${b}, ${a});`,
            a,
            direction
          });
        } else {
          data[rowIndex][columnIndex] = COLORS[getRandomInt(0, 6)];
        }
      });
    });

    this.data = data;

    if (!this.initialized) {
      this.initialized = true;
    }
  }

  play() {
    this.state = STATE_PLAYING;

    this.setupInterval();
  }

  pause() {
    this.state = STATE_PAUSED;

    clearInterval(this.intervalId);

    this.intervalId = null;
  }

  restart() {
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  inreaseUpdateInterval() {
    if (this.framePerSecond >= UPPER_UPDATE_INTERVAL) {
      return;
    }

    this.framePerSecond = this.framePerSecond * 2;
    this.restart();
  }

  decreaseUpdateInterval() {
    if (this.framePerSecond <= LOWER_UPDATE_INTERVAL) {
      return;
    }

    this.framePerSecond = this.framePerSecond / 2;
    this.restart();
  }

  setDefaultMode() {
    this.mode = MODE_DEFAULT;
  }

  doMagicTrick() {
    this.mode = MODE_MAGIC;

    this.pause();

    let image = new ImagePixelExtractor();

    image.process(this.imagePath).then(({ image, data }) => {
      const rows = Array(image.height).fill(0);
      const columns = Array(image.width).fill(0);
      let _data = [];

      // iterate over all pixels based on x and y coordinates
      for (let y = 0; y < image.height; y++) {
        if (!_data[y]) {
          _data[y] = [];
        }

        // loop through each column
        for (let x = 0; x < image.width; x++) {
          if (!_data[y][x]) {
            _data[y][x] = [];
          }

          const r = data[((image.width * y) + x) * 4];
          const g = data[((image.width * y) + x) * 4 + 1];
          const b = data[((image.width * y) + x) * 4 + 2];
          const a = Math.round((data[((image.width * y) + x) * 4 + 3] / 255) * 100) / 100;
          const direction = getRandomInt(0, 1) === 1 ? 'up' : 'down';
          const ignore = a <= 0.4 || (r === 255 && g === 255 && b === 255);
          const color = `${r}, ${g}, ${b}, ${a}`;

          _data[y][x] = {
            style: `background: rgba(${color});`,
            r, g, b, a, direction, ignore
          };
        }
      }

      this.rows = rows;
      this.columns = columns;
      this.data = _data;

      this.play();
    });
  }
}
