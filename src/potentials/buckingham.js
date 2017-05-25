let instanceData = new WeakMap();

class Buckingham {
    constructor({d0 = 1, r0 = 1, a = 2} = {}) {
        instanceData.set(this, {});
        this.d0 = d0;
        this.r0 = r0;
        this.a = a;
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
     * @returns {Buckingham}
     * @static
     */
    static from(data) {
        let buckingham = this.fastFrom(data);
        let {d0, r0, a} = buckingham; // initial approximation

        // Convergence limits
        const d0Lim = d0 / 1000;
        const r0Lim = r0 / 1000;
        const aLim = a / 1000;

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
            throw new RangeError("The 'a' parameter should be greater than 0");
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
        return d0 / (a - 6) * (6 * Math.exp(a * (1 - r / r0)) - a * Math.pow(r0 / r, 6));
    }

    toJSON() {
        return {type: "Buckingham", d0: this.d0, r0: this.r0, a: this.a};
    }
}

module.exports = Buckingham;