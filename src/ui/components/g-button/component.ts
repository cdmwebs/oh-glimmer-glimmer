import Component, { tracked } from '@glimmer/component';

export default class GButton extends Component {
  @tracked title: string;

  constructor(options) {
    super(options);

    this.title = this.args['title'] || 'Click';
  }

  onClick() {
    if (!this.args['on-click']) {
      console.log('click-click');
      return;
    }

    this.args['on-click']();
  }
};
