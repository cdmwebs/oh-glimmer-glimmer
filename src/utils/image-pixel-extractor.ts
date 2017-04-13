import RSVP from 'rsvp';
import getRandomInt from './random-int';

export default class ImagePixelExtractor {
  image: any;

  listeners: object;

  constructor() {
    this.listeners = {};
  }

  public process(path) {
    this.image = new Image();

    return new RSVP.Promise((resolve) => {
      this.image.onload = () => resolve(this.extract());
      this.image.src = path;
    });
  }

  private extract() {
    const image = this.image;

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    let imageX = 0;
    let imageY = 0;
    let imageWidth = image.width;
    let imageHeight = image.height;

    context.drawImage(image, imageX, imageY);

    let imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
    let pixelPoints = imageData.data;

    const rows = Array(image.height).fill(0);
    const columns = Array(image.width).fill(0);
    let data = [];
    let allowedCoordinates = [];

    // iterate over all pixels based on x and y coordinates
    for (let y = 0; y < image.height; y++) {
      if (!data[y]) {
        data[y] = [];
      }

      // loop through each column
      for (let x = 0; x < image.width; x++) {
        if (!data[y][x]) {
          data[y][x] = [];
        }

        const r = pixelPoints[((image.width * y) + x) * 4];
        const g = pixelPoints[((image.width * y) + x) * 4 + 1];
        const b = pixelPoints[((image.width * y) + x) * 4 + 2];
        const a = Math.round((pixelPoints[((image.width * y) + x) * 4 + 3] / 255) * 100) / 100;
        const direction = getRandomInt(0, 1) === 1 ? 'up' : 'down';
        const ignore = a <= 0.4 || (r === 255 && g === 255 && b === 255);
        const color = `${r}, ${g}, ${b}, ${a}`;

        if (!ignore) {
          allowedCoordinates.push([x, y])
        }

        data[y][x] = { style: `background: rgba(${color});`, r, g, b, a, direction, ignore };
      }
    }

    return { image, data, rows, columns, allowedCoordinates };
  }
}
