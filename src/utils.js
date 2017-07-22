module.exports = {
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