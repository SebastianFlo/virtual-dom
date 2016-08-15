// Breaking down the tree
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

// Tree helper function
function h(type, props, children) {
    return {type, props, children};
}

// tree using helper function
h('ul', {class: 'list'}, 
    h('li', {}, 'item1'),
    h('li', {}, 'item2')
);

/** @jsx h */

const a = (
    <ul class= 'list'>
    <li>item 1</li>
    <li>item 2</li>
    </ul>
);

console.log(a);