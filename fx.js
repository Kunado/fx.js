class GraphFx extends HTMLElement {
  
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.data = {};
  }
  
  attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
    this.data[attributeName] = newValue;
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        .graph-area {
          margin: 15px;
        }
      </style>
      <svg viewBox="0 0 400 400" width="600px" height="600px" class="graph-area">
        <defs>
          <marker id="arrow_head" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" viewBox="0 0 13 10" refX="5" refY="5" orient="auto">
            <polygon points="0,0 3,5 0,10 13,5 " fill="black"/>
          </marker>
        </defs>
        <g stroke="black" fill="none" font-size="14" id="axes">
          <line x1="200" y1="380" x2="200" y2="20" stroke-width="1" marker-end="url(#arrow_head)"/>
          <line x1="20" y1="200" x2="380" y2="200" stroke-width="1" marker-end="url(#arrow_head)"/>
        </g>
      </svg>
    `;
  }
}

customElements.define("graph-fx", GraphFx);