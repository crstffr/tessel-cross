import './style';

import dragula from 'dragula/dist/dragula';
import {Input} from 'cross/class/input';
import {Output} from 'cross/class/output';

const INS = 16;
const OUTS = 16;

let inputs = (new Array(INS)).fill(true).map((v, i) => new Input(i));
let outputs = (new Array(OUTS)).fill(true).map((v, i) => new Output(i));

let $ = function() {
    let r = document.querySelectorAll.apply(document, arguments);
    return Array.prototype.slice.call(r);
};

let $instruments = $('.instruments')[0];
let $outputs = $('.outputs')[0];
let $effects = $('.effects')[0];
let $chains = $('.chain');

// Setup instruments

let group = $chains.slice()
                .concat($effects)
                .concat($outputs)
                .concat($instruments);

dragula(group, {
    copy: function(el, target) {
        return false;
        //return (el.classList.contains('instrument') && target.classList.contains('instruments'));
    },
    removeOnSpill: false,
    accepts: function (el, target, source, sibling) {

        let eIsInst = el.classList.contains('instrument');
        let eIsOut = el.classList.contains('output');
        let eIsFx = el.classList.contains('effect');

        let tIsInst = target.classList.contains('instruments');
        let tIsChain = target.classList.contains('chain');
        let tIsOut = target.classList.contains('outputs');
        let tIsFx = target.classList.contains('effects');

        if (eIsInst) {
            if (tIsInst) { return true; }
            if (tIsChain) {
                return (target.querySelectorAll('.instrument').length === 0);
            }
            return false;
        } else if (eIsOut) {
            if (tIsOut) { return true; }
            if (tIsChain) {
                return (target.querySelectorAll('.output').length === 0);
            }
            return false;
        } else if (eIsFx) {
            return (tIsFx || tIsChain);
        }
        return false;
    }
}).on('drop', reorderChain);


function reorderChain(el, target, source, sibling) {

    if (!target.classList.contains('chain')) { return true; }

    let inst = target.querySelector('.instrument');
    let outp = target.querySelector('.output');

    if (inst) { target.prepend(inst); }
    if (outp) { target.append(outp); }

    // Now send to Device



    return true;
}