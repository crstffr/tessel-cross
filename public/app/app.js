import './style';

import dragula from 'dragula/dist/dragula';
import {Request} from 'cross/class/request';

// Load config;
new Request('/config').get().then((config) => {
    console.log('saved config', config);
});

let $ = function() {
    let r = document.querySelectorAll.apply(document, arguments);
    return Array.prototype.slice.call(r);
};

let $instruments = $('.instruments')[0];
let $outputs = $('.outputs')[0];
let $effects = $('.effects')[0];
let $chains = $('.chain');

let group = $chains.slice()
    .concat($effects)
    .concat($outputs)
    .concat($instruments);

dragula(group, {
    accepts: function (el, target, source, sibling) {

        let tIsInst = target.classList.contains('instruments');
        let tIsChain = target.classList.contains('chain');
        let tIsOut = target.classList.contains('outputs');
        let tIsFx = target.classList.contains('effects');

        let eIsInst = el.classList.contains('instrument');
        let eIsOut = el.classList.contains('output');
        let eIsFx = el.classList.contains('effect');


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
    new Request('/chains').post(serialize());
    return true;
}

function serialize() {
    let chains = [];
    $chains.forEach(($chain) => {
        let prev = {};
        let chain = [];
        $chain.querySelectorAll('.cross-io').forEach((el, idx) => {
            let i = 'input';
            let o = 'output';
            let input = el.hasAttribute(i) ? Number(el.getAttribute(i)) : false;
            let output = el.hasAttribute(o) ? Number(el.getAttribute(o)) : false;
            if (idx !== 0) { chain.push([prev.i, output]); }
            prev = {i: input, o: output};
        });
        chains.push(chain);
    });
    return chains;
}