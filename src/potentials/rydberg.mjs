import AbstractProto from "./abstract-proto.mjs";
import * as msg from "../messages.mjs";

let instanceData = new WeakMap();

class Rydberg extends AbstractProto {
    constructor({d0 = 1, r0 = 1, b = 2} = {}) {
        super();
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
            throw new TypeError(msg.arrExpected);
        }
        if (data.length < 3) {
            throw new Error(msg.lackOfData);
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
        return instanceData.get(this).d0;
    }
    set d0(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError(msg.numExpected("d0"));
        }
        if (value <= 0) {
            throw new RangeError(msg.greaterThan("d0"));
        }
        instanceData.get(this).d0 = value;
    }

    get r0() {
        return instanceData.get(this).r0;
    }
    set r0(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError(msg.numExpected("r0"));
        }
        if (value <= 0) {
            throw new RangeError(msg.greaterThan("r0"));
        }
        instanceData.get(this).r0 = value;
    }

    get b() {
        return instanceData.get(this).b;
    }
    set b(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError(msg.numExpected("b"));
        }
        if (value <= 1) {
            throw new RangeError(msg.greaterThan("b", 1));
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
            throw new TypeError(msg.distType);
        }
        if (r < 0) {
            throw new RangeError(msg.distRange);
        }
        let {d0, r0, b} = this;
        let factor = b * (r - r0) / r0;
        return -d0 * (1 + factor) * Math.exp(-factor);
    }

    toJSON() {
        return {type: Rydberg.type, d0: this.d0, r0: this.r0, b: this.b};
    }
}

export default Rydberg;