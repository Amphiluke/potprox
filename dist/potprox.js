/*!
potprox v0.6.0
https://amphiluke.github.io/potprox/
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.potprox = factory());
}(this, (function () { 'use strict';

    let instanceData = new WeakMap();

    class LennardJones {
        constructor({epsilon = 1, sigma = 1} = {}) {
            instanceData.set(this, {});
            this.epsilon = epsilon;
            this.sigma = sigma;
        }

        /**
         * The name of the potential class. To be used instead of
         * `instance.constructor.name` (since in the minified version names are mangled)
         * @type {String}
         * @readonly
         * @static
         */
        static get type() {
            return "LennardJones";
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

        get r0() {
            return 1.122462048309373 * this.sigma;
        }
        set r0(value) {
            this.sigma = value / 1.122462048309373;
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

        toJSON() {
            return {type: LennardJones.type, epsilon: this.epsilon, sigma: this.sigma};
        }
    }

    let instanceData$1 = new WeakMap();

    class Buckingham {
        constructor({d0 = 1, r0 = 1, a = 2} = {}) {
            instanceData$1.set(this, {});
            this.d0 = d0;
            this.r0 = r0;
            this.a = a;
        }

        /**
         * The name of the potential class. To be used instead of
         * `instance.constructor.name` (since in the minified version names are mangled)
         * @type {String}
         * @readonly
         * @static
         */
        static get type() {
            return "Buckingham";
        }

        /**
         * Create an instance of the Buckingham potential via approximation of input data.
         * This method performs fast initial approximation and is not very accurate.
         * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
         * @returns {Buckingham}
         * @static
         */
        static fastFrom(data) {
            if (!Array.isArray(data)) {
                throw new TypeError("Approximated data should be an array of points");
            }
            if (data.length < 3) {
                throw new Error("Too little points. Approximation is impossible");
            }
            data = data.slice().sort((pt1, pt2) => pt1.r - pt2.r);
            let d0 = Number.POSITIVE_INFINITY;
            let r0 = 1;
            for (let {r, e} of data) {
                if (e < d0) {
                    d0 = e;
                    r0 = r;
                }
            }
            d0 = Math.abs(d0);
            let pt1, pt2;
            for (let i = 1; i < data.length; i++) {
                pt1 = data[i - 1];
                pt2 = data[i];
                if (pt2.r >= r0 || pt1.e < 0 || pt2.e < 0) {
                    break;
                }
            }
            let a;
            if (pt1 && pt2 && pt1.r < r0 && pt2.r <= r0) {
                let sigma = pt1.e * (pt1.r - pt2.r) / (pt2.e - pt1.e) + pt1.r;
                if (sigma > 0) {
                    let A = 1 - sigma / r0;
                    let B = Math.pow(r0 / sigma, 6) / 6;
                    a = (B - A - Math.sqrt(B * B - 2 * A * B - A * A)) / (A * A);
                    if (!Number.isFinite(a)) {
                        a = undefined;
                    }
                }
            }
            return new Buckingham({d0, r0, a});
        }

        /**
         * Create an instance of the Buckingham potential via approximation of input data.
         * This method gives more accurate approximation results than the `fastFrom` method.
         * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
         * @param {Object} [settings] - Approximation settings
         * @param {Number} [settings.d0Conv=0.001] - `d0` convergence factor
         * @param {Number} [settings.r0Conv=0.001] - `r0` convergence factor
         * @param {Number} [settings.aConv=0.001] - `a` convergence factor
         * @returns {Buckingham}
         * @static
         */
        static from(data, {d0Conv = 0.001, r0Conv = 0.001, aConv = 0.001} = {}) {
            let buckingham = this.fastFrom(data);
            let {d0, r0, a} = buckingham; // initial approximation

            // Convergence limits
            const d0Lim = d0 * d0Conv;
            const r0Lim = r0 * r0Conv;
            const aLim = a * aConv;

            // Deltas
            let dd0, dr0, da;

            do {
                let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0, c7 = 0, c8 = 0, c9 = 0;
                for (let {r, e} of data) {
                    let factor = a * Math.pow(r0 / r, 6);
                    let exp = Math.exp(a * (1 - r / r0));
                    let k = d0 / (a - 6) * (6 * exp - factor);
                    let l = k / d0;
                    let m = d0 / (a - 6) * (6 * exp * a * r / (r0 * r0) - 6 * factor / r0);
                    let n = -d0 / ((a - 6) * (a - 6)) * (6 * exp - factor) +
                        d0 / (a - 6) * (6 * (1 - r / r0) * exp - factor / a);

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

            buckingham.d0 = d0;
            buckingham.r0 = r0;
            buckingham.a = a;
            return buckingham;
        }

        get d0() {
            return instanceData$1.get(this).d0;
        }
        set d0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'd0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'd0' parameter should be greater than zero");
            }
            instanceData$1.get(this).d0 = value;
        }

        get r0() {
            return instanceData$1.get(this).r0;
        }
        set r0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'r0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'r0' parameter should be greater than zero");
            }
            instanceData$1.get(this).r0 = value;
        }

        get a() {
            return instanceData$1.get(this).a;
        }
        set a(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'a' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'a' parameter should be greater than zero");
            }
            instanceData$1.get(this).a = value;
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
            return d0 / (a - 6) * (6 * Math.exp(a * (1 - r / r0)) - a * Math.pow(r0 / r, 6));
        }

        toJSON() {
            return {type: Buckingham.type, d0: this.d0, r0: this.r0, a: this.a};
        }
    }

    let instanceData$2 = new WeakMap();

    class Morse {
        constructor({d0 = 1, r0 = 1, a = 1} = {}) {
            instanceData$2.set(this, {});
            this.d0 = d0;
            this.r0 = r0;
            this.a = a;
        }

        /**
         * The name of the potential class. To be used instead of
         * `instance.constructor.name` (since in the minified version names are mangled)
         * @type {String}
         * @readonly
         * @static
         */
        static get type() {
            return "Morse";
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
         * @param {Object} [settings] - Approximation settings
         * @param {Number} [settings.d0Conv=0.001] - `d0` convergence factor
         * @param {Number} [settings.r0Conv=0.001] - `r0` convergence factor
         * @param {Number} [settings.aConv=0.001] - `a` convergence factor
         * @returns {Morse}
         * @static
         */
        static from(data, {d0Conv = 0.001, r0Conv = 0.001, aConv = 0.001} = {}) {
            let morse = this.fastFrom(data);
            let {d0, r0, a} = morse; // initial approximation

            // Convergence limits
            const d0Lim = d0 * d0Conv;
            const r0Lim = r0 * r0Conv;
            const aLim = a * aConv;

            // Deltas
            let dd0, dr0, da;

            do {
                let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0, c7 = 0, c8 = 0, c9 = 0;
                for (let {r, e} of data) {
                    let exp = Math.exp(a * (r0 - r));
                    let k = -d0 + d0 * (1 - exp) * (1 - exp);
                    let l = k / d0;
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
            return instanceData$2.get(this).d0;
        }
        set d0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'd0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'd0' parameter should be greater than zero");
            }
            instanceData$2.get(this).d0 = value;
        }

        get r0() {
            return instanceData$2.get(this).r0;
        }
        set r0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'r0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'r0' parameter should be greater than zero");
            }
            instanceData$2.get(this).r0 = value;
        }

        get a() {
            return instanceData$2.get(this).a;
        }
        set a(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'a' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'a' parameter should be greater than zero");
            }
            instanceData$2.get(this).a = value;
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

        toJSON() {
            return {type: Morse.type, d0: this.d0, r0: this.r0, a: this.a};
        }
    }

    let instanceData$3 = new WeakMap();

    class Rydberg {
        constructor({d0 = 1, r0 = 1, b = 2} = {}) {
            instanceData$3.set(this, {});
            this.d0 = d0;
            this.r0 = r0;
            this.b = b;
        }

        /**
         * The name of the potential class. To be used instead of
         * `instance.constructor.name` (since in the minified version names are mangled)
         * @type {String}
         * @readonly
         * @static
         */
        static get type() {
            return "Rydberg";
        }

        /**
         * Create an instance of the Rydberg potential via approximation of input data.
         * This method performs fast initial approximation and is not very accurate.
         * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
         * @returns {Rydberg}
         * @static
         */
        static fastFrom(data) {
            if (!Array.isArray(data)) {
                throw new TypeError("Approximated data should be an array of points");
            }
            if (data.length < 3) {
                throw new Error("Too little points. Approximation is impossible");
            }
            data = data.slice().sort((pt1, pt2) => pt1.r - pt2.r);
            let d0 = Number.POSITIVE_INFINITY;
            let r0 = 1;
            for (let {r, e} of data) {
                if (e < d0) {
                    d0 = e;
                    r0 = r;
                }
            }
            d0 = Math.abs(d0);
            let pt1, pt2;
            for (let i = 1; i < data.length; i++) {
                pt1 = data[i - 1];
                pt2 = data[i];
                if (pt2.r >= r0 || pt1.e < 0 || pt2.e < 0) {
                    break;
                }
            }
            let b;
            if (pt1 && pt2 && pt1.r < r0 && pt2.r <= r0) {
                let sigma = pt1.e * (pt1.r - pt2.r) / (pt2.e - pt1.e) + pt1.r;
                if (sigma > 0) {
                    b = r0 / (r0 - sigma);
                }
            }
            return new Rydberg({d0, r0, b});
        }

        /**
         * Create an instance of the Rydberg potential via approximation of input data.
         * This method gives more accurate approximation results than the `fastFrom` method.
         * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
         * @param {Object} [settings] - Approximation settings
         * @param {Number} [settings.d0Conv=0.001] - `d0` convergence factor
         * @param {Number} [settings.r0Conv=0.001] - `r0` convergence factor
         * @param {Number} [settings.bConv=0.001] - `b` convergence factor
         * @returns {Rydberg}
         * @static
         */
        static from(data, {d0Conv = 0.001, r0Conv = 0.001, bConv = 0.001} = {}) {
            let rydberg = this.fastFrom(data);
            let {d0, r0, b} = rydberg; // initial approximation

            // Convergence limits
            const d0Lim = d0 * d0Conv;
            const r0Lim = r0 * r0Conv;
            const bLim = b * bConv;

            // Deltas
            let dd0, dr0, db;

            do {
                let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0, c7 = 0, c8 = 0, c9 = 0;
                for (let {r, e} of data) {
                    let factor = b * (r / r0 - 1);
                    let exp = Math.exp(-factor);
                    let k = -d0 * (1 + factor) * exp;
                    let l = k / d0;
                    let m = -d0 * b * r / (r0 * r0) * exp * factor;
                    let n = d0 * factor / b * exp * factor;

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

                db = -((c4 - c1 * c7 / c2) - (c4 - c1 * c9 / c3) * ((c2 - c1 * c5 / c2) / (c2 - c1 * c6 / c3))) /
                    ((c3 - c1 * c6 / c2) - (c3 - c1 * c8 / c3) * (c2 - c1 * c5 / c2) / (c2 - c1 * c6 / c3));
                dr0 = ((c3 - c1 * c6 / c2) * db + (c4 - c1 * c7 / c2)) / (c1 * c5 / c2 - c2);
                dd0 = (-c2 * dr0 - c3 * db - c4) / c1;

                d0 += dd0;
                r0 += dr0;
                b += db;
            } while ((Math.abs(dd0) > d0Lim) && (Math.abs(dr0) > r0Lim) && (Math.abs(db) > bLim));

            rydberg.d0 = d0;
            rydberg.r0 = r0;
            rydberg.b = b;
            return rydberg;
        }

        get d0() {
            return instanceData$3.get(this).d0;
        }
        set d0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'd0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'd0' parameter should be greater than zero");
            }
            instanceData$3.get(this).d0 = value;
        }

        get r0() {
            return instanceData$3.get(this).r0;
        }
        set r0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'r0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'r0' parameter should be greater than zero");
            }
            instanceData$3.get(this).r0 = value;
        }

        get b() {
            return instanceData$3.get(this).b;
        }
        set b(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'b' parameter should be a finite number");
            }
            if (value <= 1) {
                throw new RangeError("The 'b' parameter should be greater than 1");
            }
            instanceData$3.get(this).b = value;
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
            let {d0, r0, b} = this;
            let factor = b * (r - r0) / r0;
            return -d0 * (1 + factor) * Math.exp(-factor);
        }

        toJSON() {
            return {type: Rydberg.type, d0: this.d0, r0: this.r0, b: this.b};
        }
    }

    let instanceData$4 = new WeakMap();

    class Varshni3 {
        constructor({d0 = 1, r0 = 1, b = 1} = {}) {
            instanceData$4.set(this, {});
            this.d0 = d0;
            this.r0 = r0;
            this.b = b;
        }

        /**
         * The name of the potential class. To be used instead of
         * `instance.constructor.name` (since in the minified version names are mangled)
         * @type {String}
         * @readonly
         * @static
         */
        static get type() {
            return "Varshni3";
        }

        /**
         * Create an instance of the Varshni potential (III) via approximation of input data.
         * This method performs fast initial approximation and is not very accurate.
         * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
         * @returns {Varshni3}
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
            let b = 0;
            let counter = 0;
            for (let {r, e} of data) {
                let eFactor = Math.sqrt(1 + e / d0);
                let bTemp = Number.NaN;
                if (r > r0) {
                    bTemp = Math.log(r / r0 * (1 - eFactor)) / (r0 * r0 - r * r);
                } else if (r < r0) {
                    bTemp = Math.log(r / r0 * (1 + eFactor)) / (r0 * r0 - r * r);
                }
                if (Number.isFinite(bTemp)) {
                    b += bTemp;
                    counter++;
                }
            }
            b /= counter;
            return new Varshni3({d0, r0, b});
        }

        /**
         * Create an instance of the Varshni potential (III) via approximation of input data.
         * This method gives more accurate approximation results than the `fastFrom` method.
         * @param {Array.<{r: Number, e: Number}>} data - Coordinates for approximation
         * @param {Object} [settings] - Approximation settings
         * @param {Number} [settings.d0Conv=0.001] - `d0` convergence factor
         * @param {Number} [settings.r0Conv=0.001] - `r0` convergence factor
         * @param {Number} [settings.bConv=0.001] - `b` convergence factor
         * @returns {Varshni3}
         * @static
         */
        static from(data, {d0Conv = 0.001, r0Conv = 0.001, bConv = 0.001} = {}) {
            let varshni = this.fastFrom(data);
            let {d0, r0, b} = varshni; // initial approximation

            // Convergence limits
            const d0Lim = d0 * d0Conv;
            const r0Lim = r0 * r0Conv;
            const bLim = b * bConv;

            // Deltas
            let dd0, dr0, db;

            do {
                let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0, c7 = 0, c8 = 0, c9 = 0;
                for (let {r, e} of data) {
                    let exp = r0 / r * Math.exp(b * (r0 * r0 - r * r));
                    let k = -d0 + d0 * (1 - exp) * (1 - exp);
                    let l = k / d0;
                    let m = 2 * d0 * (1 - exp) * (-exp / r0 - exp * 2 * b * r0);
                    let n = 2 * d0 * (1 - exp) * exp * (r * r - r0 * r0);

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

                db = -((c4 - c1 * c7 / c2) - (c4 - c1 * c9 / c3) * ((c2 - c1 * c5 / c2) / (c2 - c1 * c6 / c3))) /
                    ((c3 - c1 * c6 / c2) - (c3 - c1 * c8 / c3) * (c2 - c1 * c5 / c2) / (c2 - c1 * c6 / c3));
                dr0 = ((c3 - c1 * c6 / c2) * db + (c4 - c1 * c7 / c2)) / (c1 * c5 / c2 - c2);
                dd0 = (-c2 * dr0 - c3 * db - c4) / c1;

                d0 += dd0;
                r0 += dr0;
                b += db;
            } while ((Math.abs(dd0) > d0Lim) && (Math.abs(dr0) > r0Lim) && (Math.abs(db) > bLim));

            varshni.d0 = d0;
            varshni.r0 = r0;
            varshni.b = b;
            return varshni;
        }

        get d0() {
            return instanceData$4.get(this).d0;
        }
        set d0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'd0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'd0' parameter should be greater than zero");
            }
            instanceData$4.get(this).d0 = value;
        }

        get r0() {
            return instanceData$4.get(this).r0;
        }
        set r0(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'r0' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'r0' parameter should be greater than zero");
            }
            instanceData$4.get(this).r0 = value;
        }

        get b() {
            return instanceData$4.get(this).b;
        }
        set b(value) {
            if (!Number.isFinite(value)) {
                throw new TypeError("The 'b' parameter should be a finite number");
            }
            if (value <= 0) {
                throw new RangeError("The 'b' parameter should be greater than zero");
            }
            instanceData$4.get(this).b = value;
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
            let {d0, r0, b} = this;
            let factor = 1 - r0 / r * Math.exp(b * (r0 * r0 - r * r));
            return d0 * factor * factor - d0;
        }

        toJSON() {
            return {type: Varshni3.type, d0: this.d0, r0: this.r0, b: this.b};
        }
    }

    let utils = {
        /**
         * Calculate the coefficient of determination to measure the goodness of fit
         * @param {Array.<{r: Number, e: Number}>} data - Experimental/ab initio data
         * @param {Object} potential - Approximating potential
         * @returns {Number}
         * @see https://en.wikipedia.org/wiki/Coefficient_of_determination
         */
        rSqr(data, potential) {
            let avg = 0; // the mean of the experimental/ab initio data
            let ssRes = 0; // the residual sum of squares (RSS)
            for (let {r, e} of data) {
                avg += e;
                let residual = e - potential.at(r);
                ssRes += residual * residual;
            }
            avg /= data.length;
            let ssTot = 0; // the total sum of squares
            for (let {e} of data) {
                let diff = e - avg;
                ssTot += diff * diff;
            }
            return 1 - ssRes / ssTot;
        }
    };

    let potprox = Object.create(null);
    potprox[LennardJones.type] = LennardJones;
    potprox[Buckingham.type] = Buckingham;
    potprox[Morse.type] = Morse;
    potprox[Rydberg.type] = Rydberg;
    potprox[Varshni3.type] = Varshni3;

    // Other properties of the potprox object are non-enumerable to avoid mixing them with
    // potential classes when using such methods as Object.keys, Object.values etc.

    Object.defineProperty(potprox, "utils", {
        configurable: true,
        value: utils
    });

    return potprox;

})));
