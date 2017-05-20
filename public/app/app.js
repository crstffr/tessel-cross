import './style';

import dragula from 'dragula/dist/dragula';
import {Request} from 'cross/class/request';

setInterval(function() {
    new Request('/ping').get().then(enableUI).catch(disableUI);
}, 5000);

let $ = function() {
    let r = document.querySelectorAll.apply(document, arguments);
    return Array.prototype.slice.call(r);
};

let $btn1 = $('.js-do-connections')[0];
let $btn2 = $('.js-disconnect-all')[0];
let $btn3 = $('.js-load-defaults')[0];
let $btn4 = $('.js-save-defaults')[0];

$btn1.onclick = function() {
    new Request('/doconns').post({});
};

$btn2.onclick = function() {
    new Request('/disconnect').post({});
    resetChains();
};

$btn3.onclick = function() {
    new Request('/loaddefaults').post({}).then(() => {
        loadCurrent();
    });
};

$btn4.onclick = function() {
    new Request('/savedefaults').post(serialize());
};

let $instruments = $('.instruments')[0];
let $outputs = $('.outputs')[0];
let $effects = $('.effects')[0];
let $chains = $('.chain');
let $body = $('body')[0];

let group = $chains.slice()
    .concat($effects)
    .concat($outputs)
    .concat($instruments);

loadCurrent();

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
}).on('drop', onDrop);


function onDrop(el, target) {
    if (target.classList.contains('chain')) {
        reorderChain(target);
    }
    sendToDevice(serialize());
}

function sendToDevice(chains) {
    new Request('/chains').post(chains);
}

function reorderChain(target) {
    let inst = target.querySelector('.instrument');
    let outp = target.querySelector('.output');
    if (inst) { target.prepend(inst); }
    if (outp) { target.append(outp); }
}

function loadCurrent() {
    new Request('/current').get().then((data) => {
        loadFromArray(data);
    });
}

function loadFromArray(arr) {
    resetChains();
    arr.forEach((chain, i) => {
        chain.forEach((patch) => {
            let $chain = $chains[i];
            let input = Number(patch[0]);
            let output = Number(patch[1]);
            if (input >= 0) {
                input++;
                let iEl = getElbyAttrVal('input', input);
                if (iEl) {
                    $chain.appendChild(iEl);
                }
            }
            if (output >= 0) {
                output++;
                let oEl = getElbyAttrVal('output', output);
                if (oEl) {
                    $chain.appendChild(oEl);
                }
            }
        });
    });
}

function resetChains() {
    $chains.forEach(($chain) => {
        $chain.querySelectorAll('.cross-io').forEach((el) => {
            if (el.classList.contains('output')) {
                $outputs.appendChild(el);
            }
            if (el.classList.contains('effect')) {
                $effects.appendChild(el)
            }
        });
    });
}

function getElbyAttrVal(attr, val) {
    let $elem;
    $('.cross-io').forEach((el) => {
        let v = el.hasAttribute(attr) ? Number(el.getAttribute(attr)) : false;
        $elem = (v === val) ? el : $elem;
    });
    return $elem;
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
            input--;
            output--;
            if (idx !== 0) { chain.push([prev.i, output]); }
            prev = {i: input, o: output};
        });
        chains.push(chain);
    });
    return chains;
}

function disableUI() {
    $body.classList.add('disabled');
}

function enableUI() {
    $body.classList.remove('disabled');
}