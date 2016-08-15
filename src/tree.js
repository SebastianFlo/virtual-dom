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
function h(type, props, ...children) {
    return {type, props, children};
}

function createElement(node) {
    if (typeof node === 'string') {
        return document.createTextNode(node); //for plain text
    }
    const $el = document.createElement(node.type);
    node.children
        .map(createElement)
        .forEach($el.appendChild.bind($el));
    return $el; //for elements { type: ‘…’, props: { … }, children: [ … ] }
}

const a = (
    <ul class="list">
        <li>item 1</li>
        <li>item 2</li>
    </ul>
);

const $root = document.getElementById('root');
$root.appendChild(createElement(a));

/* 

    We need to check the tree differences
    - new node at new place - appendChild
    - no node at new place - removeChild
    - different node at new place - replaceChild
    - same nodes - go deeper and diff children

*/

function changed(node1, node2) {
    return typeof node1 !== typeof node2 || 
            typeof node1 === 'string' && node1 !== node2 ||
            node1.type !== node2.type
}

function updateElement($parent, newNode, oldNode, index = 0) {
    // there is no old node
    if (!oldNode) {
        $parent.appendChild(
            createElement(newNode)
        );
    }

    // there is no new node
     else if (!newNode) {
         $parent.removeChild(
             $parent.childNodes[index]
         );
     }

    //  node changed
    else if (changed(newNode, oldNode)) {
        $parent.replaceChild(
            createElement(newNode), $parent.childNodes[index]
        );
    }

    // go through all children
    else if (newNode.type) {
        const newLength = newNode.children.length;
        const oldLength = oldNode.children.length;
        for (let i = 0; i < newLength || i < oldLength; i++) {
            updateElement(
                $parent.childNodes[index],
                newNode.children[i],
                oldNode.children[i],
                i
            );
        }
    }

}

