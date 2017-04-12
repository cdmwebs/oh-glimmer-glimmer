import RSVP from 'rsvp';

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
    let canvas = document.createElement('canvas');

    let context = canvas.getContext('2d');
    let imageX = 0;
    let imageY = 0;
    let imageWidth = this.image.width;
    let imageHeight = this.image.height;

    context.drawImage(this.image, imageX, imageY);

    let imageData = context.getImageData(imageX, imageY, imageWidth, imageHeight);
    let data = imageData.data;

    return { image: this.image, data };
  }
}
