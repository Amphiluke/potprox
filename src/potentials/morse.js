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

    toJSON() {
        return {type: "Morse", d0: this.d0, r0: this.r0, a: this.a};
    }
}

module.exports = Morse;