class StatusBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        const moduleUrl = import.meta.url;
        const cssUrl = new URL('./status-bar.css', moduleUrl);

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${cssUrl}">
            <div class="status-container"></div>
        `;

        // Create a MutationObserver for `data` attribute change
        this.observer = new MutationObserver(() => {
            this.render();
        });
    }

    // Getter for 'data' property
    get data() {
        try {
            return JSON.parse(this.getAttribute('data'));
        } catch (e) {
            return this._data || {};
        }
    }

    // Setter for 'data' property
    set data(value) {
        if (typeof value === 'object') {
            this._data = value;
            this.setAttribute('data', JSON.stringify(value));
        } else {
            this.setAttribute('data', value);
        }
    }

    static get observedAttributes() {
        return ['data'];
    }

    // Called when the element is added to the DOM
    connectedCallback() {
        // Observe changes to the 'data' attribute
        this.observer.observe(this, {attributes: true});
    }

    // Called when the element is removed from the DOM
    disconnectedCallback() {
        this.observer.disconnect();
    }

    // Called when observed attributes change
    attributeChangedCallback() {
        this.render();
    }

    render() {
        const container = this.shadowRoot.querySelector('.status-container');
        if (!container) return;

        const data = this.data;
        container.innerHTML = Object.entries(data).map(([key, data]) => this.buildContent(data, key)).join('');
    }

    // Recursive function to render content
    buildContent(data, key = '') {
        if (data == null) return
        if(typeof data === 'number') data = String(data.toFixed(2))
        if (typeof data === 'string') {
            return `<span class="property">
                <span class="key">${key}:</span>
                <span class="box">${data}</span>
            </span>`;
        } else if (Array.isArray(data)) {
            return `
                <div class="property">
                    <span class="key">${key}:</span>
                    <span class="array">[${data.map(item => this.buildContent(item)).join(', ')}]</span>
                </div>
            `;
        } else if (typeof data === 'object') {
            const className = data.constructor.name || 'Object';
            const details = Object.entries(data).map(([key,data]) =>
                `<div class="property">
                    <span class="key">${key}</span>:
                    ${this.buildContent(data)}
                </div>`
            ).join('');

            return `<div class="object">
                <span class="class-name">${className}</span>
                <div class="dropdown">
                  ${details}
                </div>
              </div>`;
        }
        return '';
    }
}

customElements.define('status-bar', StatusBar);
