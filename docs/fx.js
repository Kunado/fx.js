class GraphFx extends HTMLElement {
  static get observedAttributes() {
    return [ "function", "range", "accuracy", "width", "height" ];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.data = {};
  }
  
  attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
    this.data[attributeName] = newValue;
    this._render();
  }

  fx(x) {
    let fx = new Function('x', 'return ' + this.data["function"]);
    return fx(x);
  }

  calcPoint(x) {
    let y = this.fx(x);
    let p = [x, y];
    return p;
  }

  calcCoordinate(p) {
    let range = this.data["range"];
    let xd = 200 + 180 / range * p[0];
    let yd = 200 + -1 * 180 / range * p[1];
    let pd = [xd, yd];
    return pd;
  }

  calcVector(p1, p2) {
    let v = [p2[0] - p1[0], p2[1] - p1[1]];
    return v;
  }

  calcLength(v) {
    let l = Math.sqrt(v[0]**2 + v[1]**2);
    return l;
  }

  calcInnerProduct(v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1];
  }

  calcVectorConstantMult(v, c) {
    let cv = [v[0] * c, v[1] * c];
    return cv;
  }

  calcVectorsSum(v1, v2) {
    let v = [v1[0] + v2[0], v1[1] + v2[1]];
    return v;
  }

  calcControlPoints(p0, p1, p2, p3) {
    let p0p2 = this.calcVector(p0, p2);
    let p3p1 = this.calcVector(p3, p1);
    let p1p2 = this.calcVector(p1, p2);
    let p0p2_length = this.calcLength(p0p2);
    let p3p1_length = this.calcLength(p3p1);
    let p1p2_length = this.calcLength(p1p2);
    let cos = this.calcInnerProduct(p0p2, p3p1)/(p0p2_length * p3p1_length);
    let c = ((4 * p1p2_length) / (3 * (p0p2_length + p3p1_length))) * (1 / (1 + Math.sqrt((1 + cos)/2)));
    let q = this.calcVectorsSum(p0, this.calcVectorConstantMult(p0p2, c));
    let r = this.calcVectorsSum(p2, this.calcVectorConstantMult(p3p1, c));
    let controlpoints = [q, r];
    return controlpoints;
  }

  quadraticBezierOption(p0, p1, p2, p3) {
    let controlpoints = this.calcControlPoints(p0, p1, p2, p3);
    let q = controlpoints[0];
    q = this.calcCoordinate(q);
    p1 = this.calcCoordinate(p1);
    let option = "Q" + q[0] + ", " + q[1] + " " + p1[0] + ", " + p1[1];
    return option;
  }

  cubicBezierOption(p0, p1, p2, p3) {
    let controlpoints = this.calcControlPoints(p0, p1, p2, p3);
    let q = controlpoints[0];
    let r = controlpoints[1];
    q = this.calcCoordinate(q);
    r = this.calcCoordinate(r);
    p2 = this.calcCoordinate(p2);
    let option = "C" + q[0] + ", " + q[1] + " " + r[0] + ", " + r[1] + " " + p2[0] + ", " + p2[1];
    return option;
  }

  createPath() {
    let range = this.data["range"];
    let accuracy = this.data["accuracy"];
    let path = "<path ";
    let points = new Array();
    for(let i = 0; i < 2*range/accuracy + 1; i++) {
      points[i] = this.calcPoint(-range + i * accuracy);
    }
    let startPoint = this.calcCoordinate(points[0]);
    let parameter = "M " + startPoint[0] + " " + startPoint[1];
    for(let i = 0; i < points.length -1; i++) {
      if(i == 0) {
        let p0 = points[i];
        let p1 = points[i+1];
        let p2 = points[i+2];
        let p3 = points[i+3];
        parameter += " " + this.quadraticBezierOption(p0, p1, p2, p3);
      } else if(i == points.length -2) {
        let p0 = points[i+1];
        let p1 = points[i];
        let p2 = points[i-1];
        let p3 = points[i-2];
        // parameter += " M" + p0[0] + ", " + p0[1];
        parameter += " " + this.quadraticBezierOption(p0, p1, p2, p3);
      } else {
        let p0 = points[i-1];
        let p1 = points[i];
        let p2 = points[i+1];
        let p3 = points[i+2];
        parameter += " " + this.cubicBezierOption(p0, p1, p2, p3);
      }
    }
    path += "d=\"" + parameter + "\"></path>";
    let symbol = "<symbol id=\"function\" fill=\"none\" stroke=\"black\" viewBox=\"0 0 400 400\">" + path + "</g>";
    return symbol;
  }

  _render() {
    if(this.data["function"]) {
      this.g = this.createPath();
      this.shadowRoot.innerHTML = `
      <style>
      .graph-area {
        margin: 15px;
      }
      </style>
      <svg viewBox="0 0 400 400" width="${this.data["width"]}" height="${this.data["height"]}" class="graph-area">
      <defs>
      <marker id="arrow_head" markerUnits="strokeWidth" markerWidth="5" markerHeight="5" viewBox="0 0 13 10" refX="5" refY="5" orient="auto">
      <polygon points="0,0 3,5 0,10 13,5 " fill="black"/>
      </marker>
      </defs>
      <g stroke="black" fill="none" font-size="14" id="axes">
      <line x1="200" y1="380" x2="200" y2="20" stroke-width="1" marker-end="url(#arrow_head)"/>
      <line x1="20" y1="200" x2="380" y2="200" stroke-width="1" marker-end="url(#arrow_head)"/>
      </g>
      <use href="#function" width="360" height="360" x="20" y="20"></use>
      ${this.g}
      </svg>
      `;
    }
  }
}

customElements.define("graph-fx", GraphFx);