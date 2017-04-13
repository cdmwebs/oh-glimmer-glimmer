import Component, { tracked } from '@glimmer/component';

export default class GButton extends Component {
  onClick() {
    if (!this.args['on-click']) {
      console.log('click-click');
      return;
    }

    this.args['on-click']();
  }
};
