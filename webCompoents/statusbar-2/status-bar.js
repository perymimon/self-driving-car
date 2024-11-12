import {
    camelToSnakeCase,
    createElement,
    entries,
    getPathByKey,
    getValueByKey,
    isObjIterable, splitCamelCase
} from "../../js/utils/codeflow-utils.js";

class StatusBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this._data = {};
        this._isOpen = false;
        this._seenObjects = new WeakMap();

        this._styles = null;
        const moduleUrl = import.meta.url;

        const cssUrl = new URL('./status-bar.css', moduleUrl);
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${cssUrl}">
            <div class="status-container">Loading...</div>
        `;
        //    setupEventListeners
        this.shadowRoot.addEventListener('click', (e) => {
            var {target} = e
            var test = target.closest('.item.object:not(.status-value:has(.circular-ref))');
            if (!test) return false;
            var item = target.closest(".item.object")
            if (item.querySelector('.desc')) return false;

            // if there is another .desc open on sibling close it
            var otherDesc = item.parentElement.querySelectorAll('.desc')
            otherDesc?.forEach((item) => item.remove())

            var tooltip = createElement('.desc')
            // var tooltip = document.createElement('div');
            // tooltip.classList.add('tooltip')
            const key = item.dataset.key;

            tooltip.innerHTML = this.renderTooltipTree(this._data, key);
            item.appendChild(tooltip);

            if (item.style.anchorName) {
                tooltip.style.positionAnchor = item.style.anchorName
                tooltip.classList.add('tooltip', 'tooltip-popover')
                tooltip.setAttribute('popover', 'manual')
                tooltip.showPopover()
            }

            // tooltip.addEventListener('click', (event) => {
            //     event.stopPropagation()
            //     tooltip.remove()
            // });
            // tooltip.addEventListener('click', (event) => {
            //     event.stopPropagation();
            //     tooltip.remove()
            // })

            window.addEventListener('click', event => {
                const path = event.composedPath();
                if (path.includes(item)) return
                tooltip.remove()
            }, {passive: true})
        })

    }

    static get observedAttributes() {
        return ['data'];
    }

    async connectedCallback() {
        // await this.loadResources();
        // this.render();
    }

    set data(value) {
        this._data = this.parseData(value);
        this.render();
    }

    get data() {
        return this._data;
    }

    parseData(data) {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Invalid JSON string:', e);
                return {};
            }
        }
        return data;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data') {
            this.data = newValue;
        }
    }

    render() {
        const container = this.shadowRoot.querySelector('.status-container');
        if (!container) return;
        const groupedData = this.groupData(this._data);

        container.innerHTML = `
                    <div class="status-bar">
                    <button class="toggle-button" 
                        aria-expanded="${this._isOpen}" aria-controls="details-panel"
                        title="${this._isOpen ? 'Hide' : 'Show'} details"
                    >${this._isOpen ? '▲' : '▼'}</button>
                    
                    <div class="status-bar-scroll">
                        <div class="status-bar-content">
                            ${Object.entries(groupedData).map(([groupName, items]) => `
                                <div class="status-group">
                                    ${entries(items).map(([key, value]) => `
                                        <div class="item status-item ${getValueType(value)}" data-key="${key}" style="anchor-name:--${key}">
                                            <span class="status-label">${key}:</span>
                                            <span class="status-value">${this.renderValue(value)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            `).join('')}
                                
                        </div>
                    </div>
                       
                    </div>
                     ${this._isOpen ? `
                            <div id="details-panel" class="details">
                                ${this.renderDetailTree(this._data)}
                            </div>
                        ` : ''}
                `;

        // this.setupEventListeners();
    }

    renderTooltipTree(obj, baseKeyPath, level = 0) {
        const value = getValueByKey(this._data, baseKeyPath);

        if (value instanceof HTMLElement) {
            var id = Date.now() + '|' + Math.floor(Math.random() * 1000);
            var shadow = this.shadowRoot;
            requestAnimationFrame(function append() {
                let elm = shadow.getElementById(id)
                if (elm) elm.append(value)
                else requestAnimationFrame(append)
            })
            var htmlSnapshot = `<div id="${id}" class="container-html-element" style="anchor-name=--${id}"></div>`
        }

        const fullKey = (key) => `${baseKeyPath}.${key}`
        const anchor = (key) => fullKey(key).split('.').join('-')
        const className = (obj) => Array.isArray(obj) ? '' : obj.constructor.name
        const isRoot = getPathByKey(baseKeyPath).length == 0
        const html = `
           <div class="tooltip-class-name">${className(value)}</div>
           ${htmlSnapshot ?? ''}
            <ul class="tooltip-tree">
                ${entries(value).map(([key, value]) => `
                    <li class="item status-item ${getValueType(value)}"
                     data-key="${fullKey(key)}" >
                        <strong class="status-label">${key}:</strong> 
                        <span class="status-value">
                            ${this.renderValue(obj, true, fullKey(key))}
                        </span>
                        <span class="status-class-name">
                            ${renderBasicClassName(obj, fullKey(key))}
                        </span>
                    </li>
                `).join('')}
            </ul>
        `;

        return html;
    }

    // renderDetailTree(obj, level = 0) {
    //     if (typeof obj !== 'object' || obj === null) {
    //         return String(obj);
    //     }
    //
    //    /* // Handle circular references
    //     if (this._seenObjects.has(obj)) {
    //         return '<span class="circular-ref">[Circular Reference]</span>';
    //     }
    //     this._seenObjects.set(obj, true);*/
    //
    //     const entries = Object.entries(obj);
    //     const html = entries.map(([key, value]) => {
    //         const valueType = getValueType(value);
    //         const isExpandable = typeof value === 'object' && value !== null;
    //
    //         return `
    //             <div class="details-item ${valueType}" style="margin-left: ${level * 1.5}rem">
    //                         ${isExpandable ? `
    //                             <button class="expand-button" aria-expanded="false">▶</button>
    //                         ` : ''}
    //                         <strong>${key}:</strong>
    //                         ${isExpandable ?
    //             `<div class="details-tree" style="display: none">
    //                                 ${this.renderDetailTree(value, level + 1)}
    //                             </div>` :
    //             `<span>${this.renderValue(value)}</span>`
    //         }
    //                     </div>
    //                 `;
    //     }).join('');
    //
    //     // this._seenObjects.delete(obj);
    //     return html;
    // }

    setupEventListeners() {
        // Setup expand/collapse listeners for detail view
        const expandButtons = this.shadowRoot.querySelectorAll('.expand-button');
        expandButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
                button.textContent = isExpanded ? '▶' : '▼';
                const tree = button.parentElement.querySelector('.details-tree');
                tree.style.display = isExpanded ? 'none' : 'block';
            });
        });

        this.shadowRoot.querySelector('.toggle-button')
            .addEventListener('click', () => this.toggleDetails());
    }


    groupData(data) {
        const groups = {
            physics: {},
            dimensions: {},
            metrics: {},
            other: {},
            objects: {},
        };
        const includes = (key, words) => words.some(w => splitCamelCase(key).includes(w))
        const physicsWords = 'friction,speed,acceleration,angle'.split(',')
        const dimensionWords = 'width,height,x,y'.split(',')
        entries(data).forEach(([key, value]) => {
            if (includes(key, physicsWords)) {
                groups.physics[key] = value;
            } else if (includes(key, dimensionWords)) {
                groups.dimensions[key] = value;
            } else if (typeof value === 'object') {
                groups.objects[key] = value;
            } else if (!isNaN(value)) {
                groups.metrics[key] = value;
            } else {
                groups.other[key] = value;
            }
        });
        return groups;
    }

    renderValue(rootObj, deep = false, path = '') {
        const value = getValueByKey(rootObj, path);
        const fullKey = (key) => `${path}.${key}`

        if (value == null) return String(null)
        if (typeof value === 'number') {
            return Number.isInteger(value) ? value : value.toFixed(2);
        }
        if (Array.isArray(value)) {
            if (value.length == 0) return '[]'
            return `${value.length}[${value.map((value, index) => this.renderValue(value)).join(', ')}]`
        }
        if (typeof value === 'object') {
            let className = value.constructor.name
            className = className != 'Object' ? `${className}` : ''
            { // Handle circular references
                // todo: use data-ref to highlight ref
                const seen = getPathByKey(rootObj, path);
                if (seen.includes(value)) {
                    let path = seen.slice(0, seen.indexOf(value) + 1).join(',');
                    return `<span class="circular-ref" data-ref="${path}">[${className} Circular Reference ]</span>`
                }
            }
            let keys = Object.keys(value);
            if (deep) {
                if (isObjIterable(value))
                    return `${className}{${Array.from(value).map(([key, value]) => `${key}:${this.renderValue(value)}`).join(', ')}}`
                return `${className}{${keys.length == 0 ? 'empty' : keys.join(', ')}}`
            } else {
                if (className) return className
                if (keys.length == 0) return `{}`
                return `Object{${keys.length}}`
            }

        }

        return String(value);
    }

    toggleDetails() {
        this._isOpen = !this._isOpen;
        this.render();
    }
}


function getValueType(value) {
    if (Object(value) === value) return 'object';
    if (Number(value) === value) return 'numeric';
    if (Boolean(value) === value) return 'boolean';
    return 'string';
}

function renderBasicClassName(rootObj, path) {
    const value = getValueByKey(rootObj, path);
    if (Array.isArray(value)) return ''
    if (value == null) return ''
    let className = value.constructor.name
    if (className === 'Object') return ''
    return className


}

customElements.define('status-bar', StatusBar);