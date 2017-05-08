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