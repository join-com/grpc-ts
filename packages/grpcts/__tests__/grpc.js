"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = __importStar(require("grpc"));
const Server_1 = require("../src/Server");
const Foo_1 = require("./generated/foo/Foo");
const foo = async (req) => {
    return `foo result: ${req.id} ${req.name}`;
};
const fooServerStream = (req, stream) => {
    stream.write({ result: req.name });
    stream.end();
};
const fooClientStream = async (req) => {
    var e_1, _a;
    let result = '';
    try {
        for (var _b = __asyncValues(req), _c; _c = await _b.next(), !_c.done;) {
            const reqRaw = _c.value;
            const request = reqRaw;
            result += request.id;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return `fooClientStream -> ${result}`;
};
const fooBieStream = async (duplexStream) => {
    var e_2, _a;
    try {
        for (var _b = __asyncValues(duplexStream), _c; _c = await _b.next(), !_c.done;) {
            const reqRaw = _c.value;
            const req = reqRaw;
            duplexStream.write({ result: req.name });
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    duplexStream.end();
    return;
};
describe('grpc test', () => {
    let server;
    let client;
    beforeAll(async () => {
        const service = new Foo_1.FooTest.TestSvcService({
            foo,
            fooServerStream,
            fooClientStream,
            fooBieStream,
        });
        server = new Server_1.Server(grpc.ServerCredentials.createInsecure());
        server.addService(service);
        await server.start('0.0.0.0:0');
        client = new Foo_1.FooTest.TestSvcClient(`0.0.0.0:${server.port}`, grpc.credentials.createInsecure());
    });
    afterAll(async () => {
        client.close();
        await server.tryShutdown();
    });
    it('unary grpc', async () => {
        const result = await client.foo({
            id: 11,
            name: 'name',
            password: 'saasdas',
            token: 'aaas',
        });
        expect(result).toEqual('foo result: 11 name');
    });
    it('server stream grpc', done => {
        const result = client.fooServerStream({ id: 11, name: 'Foo stream' });
        result.on('data', data => {
            expect(data).toEqual({ result: 'Foo stream' });
            done();
        });
    });
    it('client streams grpc', done => {
        const stream = client.fooClientStream((_, result) => {
            expect(result).toEqual('fooClientStream -> 37');
            done();
            return;
        });
        stream.write({ id: 3, name: 'aaa' });
        stream.write({ id: 7 });
        stream.end();
    });
    it('bie streams grpc', async () => {
        var e_3, _a;
        const stream = client.fooBieStream();
        stream.write({ id: 3, name: 'aaa' });
        stream.write({ id: 7, name: 'bbb' });
        stream.end();
        const results = [];
        try {
            for (var _b = __asyncValues(stream), _c; _c = await _b.next(), !_c.done;) {
                const reqRaw = _c.value;
                const request = reqRaw;
                results.push(request);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        expect(results).toEqual([{ result: 'aaa' }, { result: 'bbb' }]);
    });
});
