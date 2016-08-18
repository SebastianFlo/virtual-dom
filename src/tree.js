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
            props: {style: 'list-style: none;'}, 
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
    // Babel transpiles empty elements props as null, but we'd prefer an empty object'
    return {type, props: props || {}, children};
}

function createElement(node) {
    if (typeof node === 'string') {
        return document.createTextNode(node); //for plain text
    }
    const $el = document.createElement(node.type);
    setProps($el, node.props);
    addEventListeners($el, node.props);
    node.children
        .map(createElement)
        .forEach($el.appendChild.bind($el));
    return $el; //for elements { type: '…', props: { … }, children: [ … ] }
}


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
            node1.type !== node2.type ||
            node1.props && node1.props.forceUpdate;
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
        updateProps(
            $parent.childNodes[index],
            newNode.props,
            oldNode.props
        );
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

// adding props
function setProp($target, name, value) {
    if (isCustomProp(name)) {
        return;
    } else if (name === 'className') {
        $target.setAttribute('class', value);
    } else if (typeof value === 'boolean') {
        setBooleanProp($target, name, value);
    } else {
        $target.setAttribute(name, value);
    }
}

function setProps($target, props) {
    Object.keys(props).forEach(name => {
        setProp($target, name, props[name]);
    })
}

function setBooleanProp($target, name, value) {
  if (value) {
    $target.setAttribute(name, value);
    $target[name] = true;
  } else {
    $target[name] = false;
  }
}

function isCustomProp(name) {
  return isEventProp(name) || name === 'forceUpdate';
}

// removing props
function removeBooleanProp($target, name) {
  $target.removeAttribute(name);
  $target[name] = false;
}

function removeProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === 'className') {
    $target.removeAttribute('class');
  } else if (typeof value === 'boolean') {
    removeBooleanProp($target, name);
  } else {
    $target.removeAttribute(name);
  }
}

// comparing props
function updateProp($target, name, newVal, oldVal) {
  if (!newVal) {
    removeProp($target, name, oldVal);
  } else if (!oldVal || newVal !== oldVal) {
    setProp($target, name, newVal);
  }
}

function updateProps($target, newProps, oldProps = {}) {
    const props = Object.assign({}, newProps, oldProps);
    Object.keys(props).forEach(name => {
        updateProp($target, name, newProps[name], oldProps[name]);
    });
}

// events on[Click] 
function isEventProp(name) {
  return /^on/.test(name);
}

function extractEventName(name) {
  return name.slice(2).toLowerCase();
}

function addEventListeners($target, props) {
  Object.keys(props).forEach(name => {
    if (isEventProp(name)) {
      $target.addEventListener(
        extractEventName(name),
        props[name]
      );
    }
  });
}

// class is a reserved work so we use className
function log(e) {
  console.log(e.target.value);
}

const f = (
  <ul style="list-style: none;">
    <li className="item" onClick={() => alert('hi!')}>item 1</li>
    <li className="item">
      <input type="checkbox" checked={true} />
      <input type="text" onInput={log} />
    </li>
    {/* this node will always be updated */}
    <li forceUpdate={true}>text</li>
  </ul>
);

const g = (
  <ul style="list-style: none;">
    <li className="item item2" onClick={() => alert('hi!')}>item 1</li>
    <li style="background: red;">
      <input type="checkbox" checked={false} />
      <input type="text" onInput={log} />
    </li>
    {/* this node will always be updated */}
    <li forceUpdate={true}>text</li>
  </ul>
);

const $root = document.getElementById('root');
const $reload = document.getElementById('reload');

updateElement($root, f);
$reload.addEventListener('click', () => {
  updateElement($root, g, f);
});