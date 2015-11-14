export class Promise<V> {
    private state = "pending";
    private value;
    private reason;
    private fulfilledListeners: Array<{ fulfill: Function, reject: Function, listener: Function }> = [];
    private rejectedListeners: Array<{ fulfill: Function, reject: Function, listener: Function }> = [];
    constructor(private executor: (resolve, reject?) => any) {
        try {
            executor(this.fulfill.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
    }
    private fulfill(value: V) {
        if (this.state !== "pending") {
            return;
        }
        if (value && value['then']) {            
            value['then']((value) => {
                this.fulfill(value);
            }).catch((err) => {
                this.reject(err);
            });
            return;
        }
        this.state = "fulfilled";
        this.value = value;
        
        this.fulfilledListeners = this.fulfilledListeners.filter((listener) => {
            try {
                listener.fulfill(listener.listener(this.value));
            } catch (e) {
                listener.reject(e);
            }
            return false;
        });
    }
    private reject(reason) {

        if (this.state !== "pending") {
            return;
        }
        this.state = "rejected";
        this.reason = reason;
        this.rejectedListeners = this.rejectedListeners.filter((listener) => {
            try {
                listener.fulfill(listener.listener(reason));
            } catch (e) {
                listener.reject(e);
            }            
            return false;
        });
        this.fulfilledListeners = this.fulfilledListeners.filter((listener) => {
            listener.reject(this.reason);
            return false;
        });
    }
    then(onfulfill: (value: V) => any, onReject?: (reason) => any) {
        var fulfill;
        var reject;
        var promise = new Promise((fulfill_, reject_) => {
            fulfill = fulfill_;
            reject = reject_;
        });
        if (this.state === "pending") {
            if (onfulfill) {
                this.fulfilledListeners.push({ fulfill: fulfill, reject: reject, listener: onfulfill });
            }
            if (onReject) {
                this.rejectedListeners.push({ fulfill: fulfill, reject: reject, listener: onReject });
            }
        }
        if (this.state === "fulfilled" && onfulfill) {
            try {
                return Promise.resolve(onfulfill(this.value));
            } catch (e) {
                return Promise.reject(e);
            }
        }
        if (this.state === "rejected" && onfulfill) {
            reject(this.reason);            
        }
        if (this.state === "rejected" && onReject) {
            try {
                return Promise.resolve(onReject(this.reason));
            } catch (e) {
                return Promise.reject(e);
            }
        }
        return promise;
    }
    catch(onReject: (reason) => any) {
        if (this.state === "rejected" && onReject) {
            try {
                return Promise.resolve(onReject(this.reason));
            } catch (e) {
                return Promise.reject(e);
            }
        }
        
        if (this.state === "pending") {            
            var fulfill;
            var reject;
            var promise = new Promise((fulfill_, reject_) => {
                fulfill = fulfill_;
                reject = reject_;
            });
            this.rejectedListeners.push({ listener: onReject, fulfill: fulfill, reject: reject });
        }
        return promise;
    }
    static all(promises: Array<Promise<any> | any>): Promise<Array<any>> {
        var results = [];
        return Promise._all(promises, results);
    }
    private static _all(promises, results) {
        return new Promise((resolve, reject) => {
            if (promises.length > 0) {                
                var resolvek = Promise.resolve(promises.shift());
                resolvek.then((value) => {
                    results.push(value);
                    var promise = Promise._all(promises, results);                    
                    resolve(promise);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                resolve(results);
            }
        });
    }
    static race(promises: Array<Promise<any>>) {

    }
    static reject(reason): Promise<any> {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }
    static resolve(value): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(value);
        });
    }
}