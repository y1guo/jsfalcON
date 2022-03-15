export default class NBody {
    constructor(mass, pos, vel) {
        this.num = mass.length;
        this.mass = mass;
        this.pos = pos;
        this.vel = vel;
        this.acc = new Array(this.num * 3);
        this.softening = 0;
        console.assert(
            pos.length == this.num * 3,
            "[Error] NBody: position and mass do not match!"
        );
        console.assert(
            vel.length == this.num * 3,
            "[Error] NBody: velocity and mass do not match!"
        );
    }

    update(deltaTime) {
        console.assert(deltaTime != undefined);
        const t_start = window.performance.now();

        this.advancePosition(deltaTime / 2);
        if (this.num > 1000) {
            this.calcAcc_JsfalcON();
        } else {
            this.calcAcc_DirectSum();
        }
        this.advanceVelocity(deltaTime);
        this.advancePosition(deltaTime / 2);

        const t_end = window.performance.now();
        console.log("NBody:", Math.round(t_end - t_start), "ms");
    }

    advancePosition(dt) {
        for (let i = 0; i < this.num; i++) {
            for (let j = 0; j < 3; j++) {
                this.pos[3 * i + j] += this.vel[3 * i + j] * dt;
            }
        }
    }

    advanceVelocity(dt) {
        for (let i = 0; i < this.num; i++) {
            for (let j = 0; j < 3; j++) {
                this.vel[3 * i + j] += this.acc[3 * i + j] * dt;
            }
        }
    }

    calcAcc_DirectSum() {
        this.acc.fill(0);
        for (let i = 0; i < this.num; i++) {
            for (let j = i + 1; j < this.num; j++) {
                const dx = [0, 0, 0];
                for (let k = 0; k < 3; k++) {
                    dx[k] = this.pos[3 * i + k] - this.pos[3 * j + k];
                }

                let tmp = Math.pow(this.softening, 2);
                for (let k = 0; k < 3; k++) {
                    tmp += dx[k] * dx[k];
                }
                const r_cubic_inv = Math.pow(tmp, -1.5);

                const ci = -this.mass[j] * r_cubic_inv;
                const cj = -this.mass[i] * r_cubic_inv;

                for (let k = 0; k < 3; k++) {
                    this.acc[3 * i + k] += dx[k] * ci;
                    this.acc[3 * j + k] -= dx[k] * cj;
                }
            }
        }
    }

    calcAcc_JsfalcON(deltaTime) {
        this.buildTree();
        this.calcCoeff();
        this.calcForce();
        this.advancePosition();
    }

    buildTree() {}

    calcCoeff() {}

    calcForce() {}
}
