'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// Breaking down the tree
/*
const tree = {
    type: 'ul', 
    props: { class: 'list' }, 
    children: [
        { 
            type: 'li', 
            props: {}, 
            children: ['item 1'] 
        },
        { 
            type: 'li', 
            props: {}, 
            children: ['item 2'] 
        }
    ]
};
/*


/* tree using helper function
h('ul', {class: 'list'}, 
    h('li', {}, 'item1'),
    h('li', {}, 'item2')
);
*/

/*
- All variables with real DOM nodes (elements, text nodes) starting with `$` — so $parent will be real DOM element
- Virtual DOM representation will be in variable named node
- You can have only one root node — all other nodes will be inside
*/

/** @jsx h */

// Tree helper function
function h(type, props) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    return { type: type, props: props, children: children };
}

function createElement(node) {
    if (typeof node === 'string') {
        return document.createTextNode(node); //for plain text
    }
    var $el = document.createElement(node.type);
    node.children.map(createElement).forEach($el.appendChild.bind($el));
    return $el; //for elements { type: ‘…’, props: { … }, children: [ … ] }
}

/* 

    We need to check the tree differences
    - new node at new place - appendChild
    - no node at new place - removeChild
    - different node at new place - replaceChild
    - same nodes - go deeper and diff children

*/

function changed(node1, node2) {
    return (typeof node1 === 'undefined' ? 'undefined' : _typeof(node1)) !== (typeof node2 === 'undefined' ? 'undefined' : _typeof(node2)) || typeof node1 === 'string' && node1 !== node2 || node1.type !== node2.type;
}

function updateElement($parent, newNode, oldNode) {
    var index = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    // there is no old node
    if (!oldNode) {
        $parent.appendChild(createElement(newNode));
    }

    // there is no new node
    else if (!newNode) {
            $parent.removeChild($parent.childNodes[index]);
        }

        //  node changed
        else if (changed(newNode, oldNode)) {
                $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
            }

            // go through all children
            else if (newNode.type) {
                    var newLength = newNode.children.length;
                    var oldLength = oldNode.children.length;
                    for (var i = 0; i < newLength || i < oldLength; i++) {
                        updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
                    }
                }
}

var a = h(
    'ul',
    { 'class': 'list' },
    h(
        'li',
        null,
        'item 1'
    ),
    h(
        'li',
        null,
        'item 2'
    )
);

var b = h(
    'ul',
    null,
    h(
        'li',
        null,
        'item 1'
    ),
    h(
        'li',
        null,
        'hello!'
    )
);

var $root = document.getElementById('root');
var $reload = document.getElementById('reload');

updateElement($root, a);

$reload.addEventListener('click', function () {
    updateElement($root, b, a);
});