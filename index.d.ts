declare module PromiseSyncES6 {
    interface IExecutor {
        (resolve, reject?): any;
    }
    interface IFulfilledCallback {
        (value): any;
    }
    interface IRejectedCallback {
        (reason): any;
    }
}