import template from './instrument.html!text';

export class InstrumentElement extends HTMLElement {

    createdCallback() {

        this.createShadowRoot().innerHTML = template;

    }

}

document.registerElement('o-instrument', InstrumentElement);