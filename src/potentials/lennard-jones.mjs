import AbstractProto from "./abstract-proto.mjs";
import * as msg from "../messages.mjs";

let instanceData = new WeakMap();

class LennardJones extends AbstractProto {
    constructor({epsilon = 1, sigma = 1} = {}) {
        super();
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
            throw new TypeError(msg.arrExpected);
        }
        if (data.length < 3) {
            throw new Error(msg.lackOfData);
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
            throw new TypeError(msg.numExpected("epsilon"));
        }
        if (value <= 0) {
            throw new RangeError(msg.greaterThan("epsilon"));
        }
        instanceData.get(this).epsilon = value;
    }

    get sigma() {
        return instanceData.get(this).sigma;
    }
    set sigma(value) {
        if (!Number.isFinite(value)) {
            throw new TypeError(msg.numExpected("sigma"));
        }
        if (value <= 0) {
            throw new RangeError(msg.greaterThan("sigma"));
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
            throw new TypeError(msg.distType);
        }
        if (r < 0) {
            throw new RangeError(msg.distRange);
        }
        let {epsilon, sigma} = this;
        return 4 * epsilon * (Math.pow(sigma / r, 12) - Math.pow(sigma / r, 6));
    }

    toJSON() {
        return {type: LennardJones.type, epsilon: this.epsilon, sigma: this.sigma};
    }
}

export default LennardJones;
