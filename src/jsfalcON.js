import { sum, vadd, vsub, vlen, dist, vdot, vmul, bench } from "./utils";

export class Body {
    constructor(mass, pos, vel) {
        this.mass = mass;
        this.pos = pos;
        this.vel = vel;
        this.acc = [0, 0, 0];
        this.color = [1, 1, 1];
    }

    set_pos(x, y, z) {
        this.pos[0] = x;
        this.pos[1] = y;
        this.pos[2] = z;
    }

    set_vel(vx, vy, vz) {
        this.vel[0] = vx;
        this.vel[1] = vy;
        this.vel[2] = vz;
    }

    set_acc(ax, ay, az) {
        this.acc[0] = ax;
        this.acc[1] = ay;
        this.acc[2] = az;
    }
}

// dev
let id = 0;

class Node {
    constructor(parent, center, radius, bodyArray) {
        // dev
        this.id = id++;

        this.parent = parent;
        this.child = null;
        this.center = center;
        this.radius = radius;

        // dev
        // if (this.parent) {
        //     console.log(this.id, this.parent.id, bodyArray.length);
        // } else {
        //     console.log(this.id, null, bodyArray.length);
        // }

        if (bodyArray.length == 1) {
            const body = bodyArray[0];
            this.mass = body.mass;
            this.cm = body.pos; //
            this.rmax = 0;
        } else {
            this.buildChild(bodyArray);
        }
    }

    buildChild(bodyArray) {
        // build children
        const newCenter = [];
        for (let i = 0; i < 8; i++) {
            newCenter.push([0, 0, 0]);
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 3; j++) {
                newCenter[i][j] =
                    this.center[j] + this.radius * (((i >> j) & 1) - 0.5);
            }
        }

        const childBody = [];
        for (let i = 0; i < 8; i++) {
            childBody.push([]);
        }
        for (let i = 0; i < bodyArray.length; i++) {
            const body = bodyArray[i];
            let index = 0;
            for (let j = 0; j < 3; j++) {
                if (body.pos[j] > this.center[j]) {
                    index += 1 << j;
                }
            }
            childBody[index].push(body);
        }

        this.child = [];
        for (let i = 0; i < 8; i++) {
            if (childBody[i].length > 0) {
                this.child.push(
                    new Node(this, newCenter[i], this.radius / 2, childBody[i])
                );
            }
        }

        // calculate meta
        this.mass = 0;
        for (let i = 0; i < this.child.length; i++) {
            this.mass += this.child[i].mass;
        }
        this.cm = [0, 0, 0];
        for (let i = 0; i < this.child.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.cm[j] +=
                    (this.child[i].cm[j] * this.child[i].mass) / this.mass;
            }
        }
        this.rmax = 0;
        for (let i = 0; i < this.child.length; i++) {
            const r = dist(this.cm, this.child[i].cm) + this.child[i].rmax;
            if (r > this.rmax) {
                this.rmax = r;
            }
        }
        const tmp = vsub(this.cm, this.center);
        for (let i = 0; i < 3; i++) {
            tmp[i] = Math.abs(tmp[i]) + this.radius;
        }
        if (this.rmax > vlen(tmp)) {
            this.rmax = vlen(tmp);
        }
    }
}

export class NBody {
    constructor(bodyArray) {
        this.bodyArray = bodyArray;
        this.num = bodyArray.length;
        this.softening = 0;

        // dev
        // bench();
    }

    update(deltaTime) {
        console.assert(deltaTime != undefined);
        const t_start = window.performance.now();

        //

        // each advancement takes 2 ms.
        this.bodyArray.forEach((body) => {
            body.pos = vadd(body.pos, vmul(body.vel, deltaTime / 2));
        });

        //

        if (this.num > 1000) {
            this.calcAcc_JsfalcON();
        } else {
            this.calcAcc_DirectSum();
        }

        this.bodyArray.forEach((body) => {
            body.vel = vadd(body.vel, vmul(body.acc, deltaTime));
        });

        //

        this.bodyArray.forEach((body) => {
            body.pos = vadd(body.pos, vmul(body.vel, deltaTime / 2));
        });

        //

        console.log(
            "NBody:",
            Math.round(window.performance.now() - t_start),
            "ms"
        );

        // dev
        this.showTree();
    }

    calcAcc_DirectSum() {
        this.bodyArray.forEach((body) => {
            body.acc.fill(0);
        });

        for (let i = 0; i < this.num; i++) {
            const body_i = this.bodyArray[i];
            for (let j = i + 1; j < this.num; j++) {
                const body_j = this.bodyArray[j];
                const dx = vsub(body_i.pos, body_j.pos);

                const r = Math.sqrt(Math.pow(this.softening, 2) + vdot(dx, dx));
                const r_cubic_inv = 1 / (r * r * r);
                /* Note:
                 * pow(_, 3) is super slow, about 20 times slower than pow(_, 2) or pow(_, 0.5)
                 * while pow(_, 2) and pow(_, 0.5) and sqrt() are as fast as bare variable assgiments
                 */

                const ci = -body_j.mass * r_cubic_inv;
                const cj = -body_i.mass * r_cubic_inv;

                for (let k = 0; k < 3; k++) {
                    body_i.acc[k] += dx[k] * ci;
                    body_j.acc[k] -= dx[k] * cj;
                }
            }
        }
    }

    calcAcc_JsfalcON(deltaTime) {
        this.buildTree();
        this.calcCoeff();
        this.calcForce();
    }

    buildTree() {
        // find size of root box
        const limits = [
            [Infinity, -Infinity],
            [Infinity, -Infinity],
            [Infinity, -Infinity],
        ];
        for (let i = 0; i < this.num; i++) {
            const body = this.bodyArray[i];
            for (let j = 0; j < 3; j++) {
                const val = body.pos[j];
                const limit = limits[j];
                if (val < limit[0]) {
                    limit[0] = val;
                }
                if (val > limit[1]) {
                    limit[1] = val;
                }
            }
        }
        const center = [0, 0, 0];
        let radius = 0;
        for (let i = 0; i < 3; i++) {
            let limit = limits[i];
            center[i] = (limit[0] + limit[1]) / 2;
            let halfWidth = (limit[1] - limit[0]) / 2;
            if (halfWidth > radius) {
                radius = halfWidth;
            }
        }

        this.root = new Node(null, center, radius, this.bodyArray);
    }

    calcCoeff() {}

    calcForce() {
        // dummy
        for (let i = 0; i < this.num; i++) {
            this.bodyArray[i].set_acc(0, 0, 0);
        }
    }

    showTree() {}
}
