// JS operation performance hints:
// addition, multiplication, sqrt, square: about 2ns
// pow(_, 3) or pow(_, 1.5) about 50ns
// Avoid using map! Very slow!

// sum: approx 8ns
export function sum(array) {
    let s = 0;
    for (let i = 0; i < array.length; i++) {
        s += array[i];
    }
    return s;
}

// vadd: approx 8ns
export function vadd(vector1, vector2) {
    return [
        vector1[0] + vector2[0],
        vector1[1] + vector2[1],
        vector1[2] + vector2[2],
    ];
}

export function vsub(vector1, vector2) {
    return [
        vector1[0] - vector2[0],
        vector1[1] - vector2[1],
        vector1[2] - vector2[2],
    ];
}

// vmul: approx 8ns
export function vmul(vector, scaler) {
    return [vector[0] * scaler, vector[1] * scaler, vector[2] * scaler];
}

// vdot: approx 5ns
export function vdot(vector1, vector2) {
    return (
        vector1[0] * vector2[0] +
        vector1[1] * vector2[1] +
        vector1[2] * vector2[2]
    );
}

// vlen: approx 4ns
export function vlen(vector) {
    return Math.sqrt(
        vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]
    );
}

// dist: approx 5ns
export function dist(vector1, vector2) {
    const dx = vector1[0] - vector2[0];
    const dy = vector1[1] - vector2[1];
    const dz = vector1[2] - vector2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// dev
export function bench() {
    let t_start, t_end;
    const a = [];
    const b = [];
    const c = [];
    const n = 1000000;
    for (let i = 0; i < n; i++) {
        a.push(Math.random());
        const x = [Math.random(), Math.random(), Math.random()];
        const y = [Math.random(), Math.random(), Math.random()];
        b.push(x);
        c.push(y);
    }
    let tmp = 0;
    t_start = window.performance.now();
    for (let i = 0; i < n; i++) {
        tmp += vlen(b[i], c[i]);
    }
    t_end = window.performance.now();
    console.log(t_end - t_start, tmp);
}
