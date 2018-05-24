let instanceData = new WeakMap();

class Varshni3 {
    constructor({d0 = 1, r0 = 1, b = 1} = {}) {
        instanceData.set(this, {});
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

    get b() {
        return instanceData.get(this).b;
    }
    set b(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError("The 'b' parameter should be a finite number");
        }
        if (value <= 0) {
            throw new RangeError("The 'b' parameter should be greater than zero");
        }
        instanceData.get(this).b = value;
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

export default Varshni3;