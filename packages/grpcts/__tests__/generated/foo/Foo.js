"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpcTs = __importStar(require("../../../src/index"));
const path = __importStar(require("path"));
var FooTest;
(function (FooTest) {
    class TestSvcService extends grpcTs.Service {
        constructor(implementations, errorHandler) {
            const protoPath = 'foo/foo.proto';
            const includeDirs = [path.join(__dirname, '..', '..', 'proto')];
            super(protoPath, includeDirs, 'foo.test', 'TestSvc', implementations, errorHandler);
        }
    }
    FooTest.TestSvcService = TestSvcService;
    class TestSvcClient extends grpcTs.Client {
        constructor(host, credentials) {
            const protoPath = 'foo/foo.proto';
            const includeDirs = [path.join(__dirname, '..', '..', 'proto')];
            super(protoPath, includeDirs, 'foo.test', 'TestSvc', host, credentials);
        }
        foo(req) {
            return super.makeUnaryRequest('foo', req);
        }
        fooServerStream(req) {
            return super.makeServerStreamRequest('fooServerStream', req);
        }
        fooClientStream(callback) {
            return super.makeClientStreamRequest('fooClientStream', callback);
        }
        fooBieStream() {
            return super.makeBidiStreamRequest('fooBieStream');
        }
    }
    FooTest.TestSvcClient = TestSvcClient;
})(FooTest = exports.FooTest || (exports.FooTest = {}));
