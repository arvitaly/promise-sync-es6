﻿jest.dontMock('./../lib/Promise');
import {Promise} from './../lib/Promise';
describe("Promise", () => {
    it("simple fulfill", () => {
        var resolve1;
        var promise1 = new Promise((resolve, reject) => {
            resolve1 = resolve;
        });
        var value1 = "test1";
        var check1;
        promise1.then((value) => {
            check1 = value;
        });
        resolve1(value1);
        expect(check1).toBe(value1);
    });
    it("resolve promise", () => {
        var resolve1, resolve2, value1 = 235, valueCheck;
        var promise1 = new Promise((resolve, reject) => {
            resolve1 = resolve;
        });
        var promise2 = new Promise((resolve, reject) => {
            resolve2 = resolve;
        });
        resolve1(promise2);
        promise1.then((value) => {
            valueCheck = value;
        });
        resolve2(value1);
        expect(valueCheck).toBe(value1);
    });
    it("simple reject", () => {
        var reject1;
        var promise1 = new Promise((resolve, reject) => {
            reject1 = reject;
        });
        var reason1;
        promise1.catch((reason) => {
            reason1 = reason;
        });
        var error = "error1";
        reject1(error);
        expect(reason1).toBe(error);
    });
    it("error with execute", () => {
        var error1 = "error3";
        var promise1 = new Promise((resolve, reject) => {
            throw error1;
        });
        var reason1;
        promise1.catch((reason) => {
            reason1 = reason;
        });
        
    });
    it("double fulfill", () => {
        var resolve1;
        var promise = new Promise((resolve, reject) => {
            resolve1 = resolve;
        });
        var value1;
        promise.then((value) => {
            value1 = value;
        });        
        resolve1("value1");
        resolve1("value2");
        expect(value1).toBe("value1");
    });
    it("double reject or fulfill", () => {
        var reject1;
        var resolve1;
        var promise = new Promise((resolve, reject) => {
            resolve1 = resolve;
            reject1 = reject;
        });
        var value1;
        promise.then((value) => {
            value1 = value;
        });
        var reason1;
        promise.catch((reason) => {
            reason1 = reason;
        });
        reject1("reason1");
        resolve1("value1");        
        reject1("reason2");
        resolve1("value2");
        expect(value1).toBeUndefined();
        expect(reason1).toBe("reason1");
    });
    it("simple promise chain", () => {
        var resolve1;
        var promise1 = new Promise<any>((resolve, reject) => {
            resolve1 = resolve;
        });
        var value1 = 16;
        var value2 = 13;
        var valueCheck;
        promise1.then((value) => {
            return value + value1;
        }).then((value) => {
            valueCheck = value + value2;
            });
        resolve1(value1);
        expect(valueCheck).toBe(value1 + value1 + value2);
    });
    it("fulfill after reject", () => {
        var reject1;
        var promise = new Promise((resolve, reject) => {
            reject1 = reject;
        });
        var value1 = 12, value2 = 13, valueCheck;        
        promise.catch((err) => {
            return value1;
        }).then((value) => {
            valueCheck = value + value2;
        });
        reject1();
        expect(valueCheck).toBe(value1 + value2);
    });
    it("Promise resolve", () => {
        var value1 = 234, value2 = 3523, valueCheck;
        Promise.resolve(value1).then((value) => {
            valueCheck = value + value2;
        });
        expect(valueCheck).toBe(value1 + value2);
    });
    it("Promise reject, and then", () => {
        var value1 = 234, value2 = 3523, valueCheck;
        Promise.reject(value1).catch((value) => {
            return value + value2;
        }).then((value) => {
            valueCheck = value;
        });
        expect(valueCheck).toBe(value1 + value2);
    });
    it("Reject chain", () => {
        var reason = "err", reject1, reason1;
        var promise = new Promise((resolve, reject) => {
            reject1 = reject;
        });
        
        promise.then(() => { }).catch((err) => {
            reason1 = err;
        });
        reject1(reason);
        expect(reason1).toBe(reason);
    });
    it("Resolve All success", () => {
        var resolve1, value1 = 213, resolve2, value2 = 4534, value3 = 345345, valueCheck;
        var promise1 = new Promise((resolve, reject) => {
            resolve1 = resolve;
        });
        var promise2 = new Promise((resolve, reject) => {
            resolve2 = resolve;
        });
        var promise = Promise.all([promise1, promise2, value1]);
        resolve1(value2);
        resolve2(value3);
        promise.then((values) => {
            return values[0] + values[1] + values[2];
        }).then((value) => {
            valueCheck = value;
        }).catch((err) => {
            console.error(err);
        });
        expect(valueCheck).toBe(value1 + value2 + value3);
    });
    it("Promise all reject", () => {
        var error = "err1", reason;
        Promise.all([Promise.resolve(12), 15, Promise.reject(error)]).catch((err) => {
            reason = err;
        });
        expect(reason).toBe(error);
    });
});