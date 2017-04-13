import Component, {tracked} from "@glimmer/component";
import ImagePixelExtractor from '../../../utils/image-pixel-extractor';
import getRandomInt from '../../../utils/random-int';
import getRandomColor from '../../../utils/random-color';

const MODE_DEFAULT = 'default';
const MODE_MAGIC = 'magic';
const MODE_STATIC = 'static';

const STATE_PLAYING = 'playing';
const STATE_PAUSED = 'paused';

const LOWER_UPDATE_INTERVAL = 2;
const UPPER_UPDATE_INTERVAL = 1024;

const DEFAULT_FPS = 30;
const DEFAULT_UPDATE_POINTS_AMOUNT = 40;

const DEFAULT_WIDTH = 150;
const DEFAULT_HEIGHT = 40;

const DEFAULT_IMAGE = 'glimmer_40.png';
const MAGIC_IMAGE = 'glimmer_text_40.png';

export default class OhGlimmerGlimmer extends Component {
  private intervalId: number;
  private allowedCoordinates: any;

  @tracked loading: boolean;
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

  @tracked('loading', 'isDefaultMode')
  get buttonText() {
    if (this.loading) {
      return '...';
    }

    return this.isDefaultMode ? 'Magic Trick' : 'Default Mode';
  }

  constructor(options) {
    super(options);

    this.allowedCoordinates = [];
    this.loading = false;
    this.mode = MODE_STATIC;
    this.intervalId = null;
    this.rows = Array(DEFAULT_HEIGHT).fill(0);
    this.columns = Array(DEFAULT_WIDTH).fill(0);
    this.state = STATE_PAUSED;
    this.framePerSecond = DEFAULT_FPS;
    this.updateAtOnceAmount = DEFAULT_UPDATE_POINTS_AMOUNT;

    this.renderImage(DEFAULT_IMAGE);
  }

  private setupInterval() {
    this.intervalId = setInterval(() => requestAnimationFrame(() => this.update()), 1000 / this.framePerSecond);
  }

  private update() {
    let data: Array<any> = this.data || [];
    let allowedCoordinates = this.allowedCoordinates;
    let currentRandomMonth: Array<number> = Array(this.updateAtOnceAmount).fill(0).map(() => getRandomInt(0, allowedCoordinates.length - 1));

    if (this.allowedCoordinates.length) {
      for (let i = 0; i < this.updateAtOnceAmount; i++) {
        const index = currentRandomMonth[i];
        let [columnIndex, rowIndex] = allowedCoordinates[index];

        if (this.mode === MODE_MAGIC || this.mode === MODE_STATIC) {
          let _item = data[rowIndex][columnIndex];
          let {r, g, b, a, direction} = _item;

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
          data[rowIndex][columnIndex] = getRandomColor(0, 6);
        }
      }
    }
  }

  play() {
    this.state = STATE_PLAYING;
    this.setupInterval();
  }

  pause() {
    this.state = STATE_PAUSED;
    clearInterval(this.intervalId);
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

    this.rows = Array(DEFAULT_HEIGHT).fill(0);
    this.columns = Array(DEFAULT_WIDTH).fill(0);

    let _allowedCoordinates = [];

    this.rows.forEach((row, rowIndex) => {
      this.columns.forEach((column, columnIndex) => {
        _allowedCoordinates.push([columnIndex, rowIndex]);
      });
    });

    this.allowedCoordinates = _allowedCoordinates;
  }

  doMagicTrick() {
    this.mode = MODE_MAGIC;
    this.renderImage(MAGIC_IMAGE);
  }

  private renderImage(imagePath) {
    this.pause();
    this.loading = true;

    let image = new ImagePixelExtractor();

    image.process(imagePath).then(({ data, rows, columns, allowedCoordinates }) => {
      this.rows = rows;
      this.columns = columns;
      this.data = data;
      this.allowedCoordinates = allowedCoordinates;
      this.loading = false;

      this.play();
    });
  }
}
