[![Build and test](https://github.com/Amphiluke/potprox/actions/workflows/build-and-test.yml/badge.svg?branch=master)](https://github.com/Amphiluke/potprox/actions/workflows/build-and-test.yml)

# potprox

Approximation of computed data with empirical pair potentials.

## Synopsis

It is a quite common case when there is a need to describe computed numerical *ab initio* data with some analytical form of pair potential (e.g. the [Lennard-Jones function](https://en.wikipedia.org/wiki/Lennard-Jones_potential) or the [Morse function](https://en.wikipedia.org/wiki/Morse_potential)).

Potprox uses the [method of least squares](https://en.wikipedia.org/wiki/Least_squares) to approximate computed data with empirical pair potentials. The list of currently available potentials includes

* [The Lennard-Jones potential](#the-potproxlennardjones-class)
* [The modified Buckingham potential](#the-potproxbuckingham-class) (the exp-6 potential)
* [The Morse potential](#the-potproxmorse-class)
* [The Rydberg potential](#the-potproxrydberg-class)
* [The Varshni potential (III)](#the-potproxvarshni3-class)

## Install and load potprox

### As a Node.js module

Installing the package:

```shell
npm install potprox
```

Importing the module:

```javascript
import * as potprox from "potprox";
```

or (for CommonJS modules)

```javascript
let potprox = require("potprox");
```

If you need only a few potential classes, using named import will allow module bundlers to perform “tree shaking” and exclude the rest unused code.

```javascript
import {Morse, Rydberg} from "potprox";
```

### In browsers

The module can be loaded from the popular CDNs like unpkg or jsDelivr.

```html
<script src="https://cdn.jsdelivr.net/npm/potprox/dist/potprox.min.js"></script>
```

If you use ES modules, you may import the potprox module from the [potprox.min.mjs](dist/potprox.min.mjs) file:

```javascript
import * as potprox from "https://cdn.jsdelivr.net/npm/potprox/dist/potprox.min.mjs";
```

### In web workers

```javascript
importScripts("https://www.unpkg.com/potprox");
```

## Usage

Here is an example of approximation of some external computational data using the potprox module.

```javascript
import * as potprox from "potprox";

// Computed numerical data on energy of interatomic binding
// r - interatomic distance
// e - binding energy
let data = [
    {r: 10.0, e: 0},
    {r: 9.5, e: -0.00065673},
    {r: 9.0, e: -0.00173718},
    {r: 8.5, e: -0.00346348},
    {r: 8.0, e: -0.00612669},
    {r: 7.5, e: -0.01005967},
    {r: 7.0, e: -0.01554171},
    {r: 6.5, e: -0.02256036},
    {r: 6.0, e: -0.03028974},
    {r: 5.5, e: -0.03598181},
    {r: 5.0, e: -0.03234259},
    {r: 4.5, e: 0.00189849},
];

// Approximate with the Lennard-Jones potential
let lennardjones = potprox.LennardJones.from(data);
console.log("Lennard-Jones potential info:", lennardjones.toJSON());

// Approximate with the exp-6 potential
let buckingham = potprox.Buckingham.from(data);
console.log("Buckingham potential info:", buckingham.toJSON());

// Approximate with the Morse potential
let morse = potprox.Morse.from(data);
console.log("Morse potential info:", morse.toJSON());

// Approximate with the Rydberg potential
let rydberg = potprox.Rydberg.from(data);
console.log("Rydberg potential info:", rydberg.toJSON());

// Approximate with the Varshni potential (III)
let varshni = potprox.Varshni3.from(data);
console.log("Varshni potential (III) info:", varshni.toJSON());
```

## API

### The `potprox` object

The potprox module exports an object with potential names as keys and potential classes as values.

```javascript
console.log(potprox); // => Object {LennardJones: <class>, Buckingham: <class>, ...}
```

### The `potprox.LennardJones` class

An instance of the `LennardJones` class represents the Lennard-Jones potential with the given parameters `epsilon` and `sigma`.

$$V\left(r\right)=4\varepsilon\left[\left(\frac{\sigma}{r}\right)^{12}-\left(\frac{\sigma}{r}\right)^6\right]$$

You may instantiate the `LennardJones` class as follows:

```javascript
let lennardjones = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
```

### The `potprox.Buckingham` class

An instance of the `Buckingham` class represents the modified Buckingham potential (the exp-6 potential) with the given parameters `d0`, `r0`, and `a` (which are often referenced to as *ε*, *r<sub>m</sub>*, and *α* respectively).

$$V\left(r\right)=\frac{D_0}{1-6/a}\left(\frac{6}{a}\exp\left[a\left(1-\frac{r}{r_0}\right)\right]-\left(\frac{r_0}{r}\right)^6\right)$$

You may instantiate the `Buckingham` class as follows:

```javascript
let buckingham = new potprox.Buckingham({d0: 0.0360, r0: 5.298, a: 4.332});
```

### The `potprox.Morse` class

An instance of the `Morse` class represents the Morse potential with the given parameters `d0`, `r0`, and `a` (which are often referenced to as *D<sub>e</sub>*, *r<sub>e</sub>*, and *α* respectively).

$$V\left(r\right)=-D_0+D_0\left[1-\exp\left(-a\left(r-r_0\right)\right)\right]^2$$

You may instantiate the `Morse` class as follows:

```javascript
let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
```

### The `potprox.Rydberg` class

An instance of the `Rydberg` class represents the Rydberg potential with the given parameters `d0`, `r0`, and `b`.

$$V\left(r\right)=-D_0\left[1+\frac{b}{r_0}\left(r-r_0\right)\right]\exp\left[-\frac{b}{r_0}\left(r-r_0\right)\right]$$

You may instantiate the `Rydberg` class as follows:

```javascript
let rydberg = new potprox.Rydberg({d0: 0.0368, r0: 5.350, b: 6.415});
```

### The `potprox.Varshni3` class

An instance of the `Varshni3` class represents the Varshni potential (III) with the given parameters `d0`, `r0`, and `b`.

$$V\left(r\right)=-D_0+D_0\left[1-\frac{r_0}{r}\exp\left(-b\left(r^2-r_0^2\right)\right)\right]^2$$

You may instantiate the `Varshni3` class as follows:

```javascript
let varshni = new potprox.Varshni3({d0: 0.0368, r0: 5.389, b: 0.0597});
```

### Potential class members

All the classes in the `potprox` object have a few members listed below.

#### `type`

The *static* read-only property containing the name of the potential class (e.g. `"LennardJones"`, `"Morse"`, `"Buckingham"` etc.).

```javascript
console.log(potprox.LennardJones.type); // => "LennardJones"
```

#### `from(data [, settings])`

The *static* method `from` creates an instance of the specific class with potential parameters obtained via the least squares approximation procedure.

The first (required) argument is input approximated data, an array of objects `{r: Number, e: Number}`, where `r` is an interatomic distance, and `e` is the corresponding binding energy. Refer the [Usage](#usage) section for an example.

The second (optional) argument can be specified to override approximation settings. Thus in order to get better approximation results you may decrease convergence limits by specifying custom convergence factors for all or some potential parameters.

```javascript
let morse = potprox.Morse.from(data, {d0Conv: 0.0001, r0Conv: 0.0001, aConv: 0.0001});
let rydberg = potprox.Rydberg.from(data, {b0Conv: 0.0001});
```

Be careful though when using too small convergence factors as this may end up with performance issues. Consider using web workers if you need high-accuracy approximation but things appear to get slow.

#### `at(r)`

Calculates the value of the potential for the given interatomic distance.

```javascript
let lennardjones = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
console.log(lennardjones.at(6.0)); // => -0.02399355483055115

let buckingham = new potprox.Buckingham({d0: 0.0360, r0: 5.298, a: 4.332});
console.log(buckingham.at(6.0)); // => -0.028625141782941267

let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
console.log(morse.at(6.0)); // => -0.029435553046279185

let rydberg = new potprox.Rydberg({d0: 0.0368, r0: 5.350, b: 6.415});
console.log(rydberg.at(6.0)); // => -0.030035419908893232

let varshni = new potprox.Varshni3({d0: 0.0368, r0: 5.389, b: 0.0597});
console.log(varshni.at(6.0)); // => -0.03069928686072358
```

#### `points([options])`

The method `points` can be used to generate points of a potential function in the given distance range. The method takes one optional argument and returns a [Generator object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) which you may iterate over. The optional parameter of the method is the configuration object. The following configuration options are available (each of them is optional):

* `start` — starting interatomic distance to generate points from (by default it’s set to a half of the equilibrium distance);
* `end` — end interatomic distance where to stop (by default it’s double of the equilibrium distance);
* `step` — step for point generation (default step is configured to generate 50 points).

```javascript
let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});

// Generate 50 points starting from r = r0/2 and finishing at r = 2*r0
for (let {r, e, index} of morse.points()) {
    console.log(`${index + 1}. r = ${r.toFixed(4)} nm; E = ${e.toFixed(3)} eV`);
}

// Generate 30 points in the user-defined distance range
let start = 5.0;
let end = 8.5;
let pointCount = 30;
let step = (end - start) / (pointCount - 1);
for (let {r, e, index} of morse.points({start, end, step})) {
    console.log(`${index + 1}. r = ${r.toFixed(4)} nm; E = ${e.toFixed(3)} eV`);
}

// Generate points infinitely until the given energy threshold is reached
for (let {r, e, index} of morse.points({start: 5.0, end: Infinity, step: 0.1})) {
    console.log(`${index + 1}. r = ${r.toFixed(4)} nm; E = ${e.toFixed(5)} eV`);
    if (e > -0.001) {
        break;
    }
}
```

#### `rSqr(data)`

Use the method `rSqr` to calculate the [coefficient of determination](https://en.wikipedia.org/wiki/Coefficient_of_determination) _R²_, a measure of goodness of fit. The method takes the initial data array as an argument (same as that passed to the [`from` method](#fromdata--settings)).

```javascript
let morse = potprox.Morse.from(data);
let rSqr = morse.rSqr(data);
console.log(`Coefficient of determination = ${rSqr}`);
```

#### `toJSON()`

Returns an object containing information on the potential. This information is enough to restore the potential instance form a serializable JSON object (see the [Tips](#tips) section for details).

```javascript
let lennardjones = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
console.log(lennardjones.toJSON()); // => {type: "LennardJones", epsilon: 0.041, sigma: 4.5}

let buckingham = new potprox.Buckingham({d0: 0.0360, r0: 5.298, a: 4.332});
console.log(buckingham.toJSON()); // => {type: "Buckingham", d0: 0.036, r0: 5.298, a: 4.332}

let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
console.log(morse.toJSON()); // => {type: "Morse", d0: 0.0368, r0: 5.316, a: 0.867}

let rydberg = new potprox.Rydberg({d0: 0.0368, r0: 5.350, b: 6.415});
console.log(rydberg.toJSON()); // => {type: "Rydberg", d0: 0.0368, r0: 5.350, b: 6.415}

let varshni = new potprox.Varshni3({d0: 0.0368, r0: 5.389, b: 0.0597});
console.log(varshni.toJSON()); // => {type: "Varshni3", d0: 0.0368, r0: 5.389, b: 0.0597}
```

Note that the potential parameters are also available as direct instance properties, and you may change them at any time.

## Tips

The overridden method `toJSON()` allows the instances of the potprox potential classes to be easily serialized to a JSON string, and restored from the JSON string later on.

```javascript
// Create and serialize
let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
let json = JSON.stringify(morse);

// Unserialize and restore
let potentialData = JSON.parse(json);
let morseCopy = new potprox[potentialData.type](potentialData);
```
