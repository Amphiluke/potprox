(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.potprox = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
let instanceData = new WeakMap();

class LennardJones {
    constructor({epsilon = 1, sigma = 1} = {}) {
        instanceData.set(this, {});
        this.epsilon = epsilon;
        this.sigma = sigma;
    }

    /**
     * Create an instance of the Lennard-Jones potential via approximation of input data
     * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
     * @returns {LennardJones}
     * @static
     */
    static from(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("Approximated data should be an array of points");
        }
        if (data.length < 3) {
            throw new Error("Too little points. Approximation is impossible");
        }
        let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
        for (let {r, e} of data) {
            c1 += Math.pow(r, -24);
            c2 += Math.pow(r, -18);
            c3 += e * Math.pow(r, -12);
            c4 += Math.pow(r, -12);
            c5 += e * Math.pow(r, -6);
        }
        let b = (c5 - c2 * c3 / c1) / (c4 - c2 * c2 / c1);
        let a = (c3 - c2 * b) / c1;
        let sigma = Math.pow(-a / b, 1 / 6);
        let epsilon = a / (4 * Math.pow(sigma, 12));
        return new LennardJones({epsilon, sigma});
    }

    get epsilon() {
        return instanceData.get(this).epsilon;
    }
    set epsilon(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError("The 'epsilon' parameter should be a finite number");
        }
        if (value <= 0) {
            throw new RangeError("The 'epsilon' parameter should be greater than zero");
        }
        instanceData.get(this).epsilon = value;
    }

    get sigma() {
        return instanceData.get(this).sigma;
    }
    set sigma(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError("The 'sigma' parameter should be a finite number");
        }
        if (value <= 0) {
            throw new RangeError("The 'sigma' parameter should be greater than zero");
        }
        instanceData.get(this).sigma = value;
    }

    /**
     * Calculate the energy for the given interatomic distance
     * @param {Number} r
     * @returns {Number}
     */
    at(r) {
        if (typeof r !== "number") {
            throw new TypeError("Distance should be a number");
        }
        if (r < 0) {
            throw new RangeError("Distance shouldn't be less than zero");
        }
        let {epsilon, sigma} = this;
        return 4 * epsilon * (Math.pow(sigma / r, 12) - Math.pow(sigma / r, 6));
    }
}

module.exports = LennardJones;
},{}],2:[function(require,module,exports){
let instanceData = new WeakMap();

class Morse {
    constructor({d0 = 1, r0 = 1, a = 1} = {}) {
        instanceData.set(this, {});
        this.d0 = d0;
        this.r0 = r0;
        this.a = a;
    }

    /**
     * Create an instance of the Morse potential via approximation of input data.
     * This method performs fast initial approximation and is not very accurate.
     * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
     * @returns {Morse}
     * @static
     */
    static fastFrom(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("Approximated data should be an array of points");
        }
        if (data.length < 3) {
            throw new Error("Too little points. Approximation is impossible");
        }
        let d0 = Number.POSITIVE_INFINITY;
        let r0 = 1;
        for (let {r, e} of data) {
            if (e < d0) {
                d0 = e;
                r0 = r;
            }
        }
        d0 = Math.abs(d0);
        let a = 0;
        let counter = 0;
        for (let {r, e} of data) {
            let eFactor = Math.sqrt(1 + e / d0);
            let aTemp = Number.NaN;
            if (r > r0) {
                aTemp = Math.log(1 - eFactor) / (r0 - r);
            } else if (r < r0) {
                aTemp = Math.log(1 + eFactor) / (r0 - r);
            }
            if (Number.isFinite(aTemp)) {
                a += aTemp;
                counter++;
            }
        }
        a /= counter;
        return new Morse({d0, r0, a});
    }

    /**
     * Create an instance of the Morse potential via approximation of input data.
     * This method gives more accurate approximation results than the `fastFrom` method.
     * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
     * @returns {Morse}
     * @static
     */
    static from(data) {
        let morse = this.fastFrom(data);
        let {d0, r0, a} = morse; // initial approximation

        // Convergence limits
        const d0Lim = d0 / 1000;
        const r0Lim = r0 / 1000;
        const aLim = a / 1000;

        // Deltas
        let dd0, dr0, da;

        do {
            let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0, c7 = 0, c8 = 0, c9 = 0;
            for (let {r, e} of data) {
                let exp = Math.exp(a * (r0 - r));
                let k = -d0 + d0 * (1 - exp) * (1 - exp);
                let l = (1 - exp) * (1 - exp) - 1;
                let m = -2 * d0 * (1 - exp) * a * exp;
                let n = 2 * d0 * (1 - exp) * (r - r0) * exp;

                c1 += l * l;
                c2 += m * l;
                c3 += n * l;
                c4 += (k - e) * l;
                c5 += m * m;
                c6 += n * m;
                c7 += (k - e) * m;
                c8 += n * n;
                c9 += (k - e) * n;
            }

            da = -((c4 - c1 * c7 / c2) - (c4 - c1 * c9 / c3) * ((c2 - c1 * c5 / c2) / (c2 - c1 * c6 / c3))) /
                ((c3 - c1 * c6 / c2) - (c3 - c1 * c8 / c3) * (c2 - c1 * c5 / c2) / (c2 - c1 * c6 / c3));
            dr0 = ((c3 - c1 * c6 / c2) * da + (c4 - c1 * c7 / c2)) / (c1 * c5 / c2 - c2);
            dd0 = (-c2 * dr0 - c3 * da - c4) / c1;

            d0 += dd0;
            r0 += dr0;
            a += da;
        } while ((Math.abs(dd0) > d0Lim) && (Math.abs(dr0) > r0Lim) && (Math.abs(da) > aLim));

        morse.d0 = d0;
        morse.r0 = r0;
        morse.a = a;
        return morse;
    }

    get d0() {
        return instanceData.get(this).d0;
    }
    set d0(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError("The 'd0' parameter should be a finite number");
        }
        if (value <= 0) {
            throw new RangeError("The 'd0' parameter should be greater than zero");
        }
        instanceData.get(this).d0 = value;
    }

    get r0() {
        return instanceData.get(this).r0;
    }
    set r0(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError("The 'r0' parameter should be a finite number");
        }
        if (value <= 0) {
            throw new RangeError("The 'r0' parameter should be greater than zero");
        }
        instanceData.get(this).r0 = value;
    }

    get a() {
        return instanceData.get(this).a;
    }
    set a(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError("The 'a' parameter should be a finite number");
        }
        if (value <= 0) {
            throw new RangeError("The 'a' parameter should be greater than zero");
        }
        instanceData.get(this).a = value;
    }

    /**
     * Calculate energy for the given interatomic distance
     * @param {Number} r
     * @returns {Number}
     */
    at(r) {
        if (typeof r !== "number") {
            throw new TypeError("Distance should be a number");
        }
        if (r < 0) {
            throw new RangeError("Distance shouldn't be less than zero");
        }
        let {d0, r0, a} = this;
        let factor = 1 - Math.exp(a * (r0 - r));
        return d0 * factor * factor - d0;
    }
}

module.exports = Morse;
},{}],3:[function(require,module,exports){
let potprox = {
    LennardJones: require("./potentials/lennard-jones.js"),
    Morse: require("./potentials/morse.js")
};

module.exports = potprox;
},{"./potentials/lennard-jones.js":1,"./potentials/morse.js":2}]},{},[3])(3)
});