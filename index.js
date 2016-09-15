var Promise = (function () {
    function Promise(executor) {
        this.executor = executor;
        this.state = "pending";
        this.fulfilledListeners = [];
        this.rejectedListeners = [];
        try {
            executor(this.fulfill.bind(this), this.reject.bind(this));
        }
        catch (e) {
            this.reject(e);
        }
    }
    Promise.prototype.fulfill = function (value) {
        var _this = this;
        if (this.state !== "pending") {
            return;
        }
        if (value && value['then']) {
            value['then'](function (value) {
                _this.fulfill(value);
            }).catch(function (err) {
                _this.reject(err);
            });
            return;
        }
        this.state = "fulfilled";
        this.value = value;
        this.fulfilledListeners = this.fulfilledListeners.filter(function (listener) {
            try {
                listener.fulfill(listener.listener(_this.value));
            }
            catch (e) {
                listener.reject(e);
            }
            return false;
        });
    };
    Promise.prototype.reject = function (reason) {
        var _this = this;
        if (this.state !== "pending") {
            return;
        }
        this.state = "rejected";
        this.reason = reason;
        this.rejectedListeners = this.rejectedListeners.filter(function (listener) {
            try {
                listener.fulfill(listener.listener(reason));
            }
            catch (e) {
                listener.reject(e);
            }
            return false;
        });
        this.fulfilledListeners = this.fulfilledListeners.filter(function (listener) {
            listener.reject(_this.reason);
            return false;
        });
    };
    Promise.prototype.then = function (onfulfill, onReject) {
        var fulfill;
        var reject;
        var promise = new Promise(function (fulfill_, reject_) {
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
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        if (this.state === "rejected" && onfulfill) {
            reject(this.reason);
        }
        if (this.state === "rejected" && onReject) {
            try {
                return Promise.resolve(onReject(this.reason));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        return promise;
    };
    Promise.prototype.catch = function (onReject) {
        if (this.state === "rejected" && onReject) {
            try {
                return Promise.resolve(onReject(this.reason));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        if (this.state === "pending") {
            var fulfill;
            var reject;
            var promise = new Promise(function (fulfill_, reject_) {
                fulfill = fulfill_;
                reject = reject_;
            });
            this.rejectedListeners.push({ listener: onReject, fulfill: fulfill, reject: reject });
        }
        return promise;
    };
    Promise.all = function (promises) {
        var results = [];
        return Promise._all(promises, results);
    };
    Promise._all = function (promises, results) {
        return new Promise(function (resolve, reject) {
            if (promises.length > 0) {
                var resolvek = Promise.resolve(promises.shift());
                resolvek.then(function (value) {
                    results.push(value);
                    var promise = Promise._all(promises, results);
                    resolve(promise);
                }).catch(function (err) {
                    reject(err);
                });
            }
            else {
                resolve(results);
            }
        });
    };
    Promise.race = function (promises) {
    };
    Promise.reject = function (reason) {
        return new Promise(function (resolve, reject) {
            reject(reason);
        });
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve, reject) {
            resolve(value);
        });
    };
    return Promise;
})();
module.exports = Promise;