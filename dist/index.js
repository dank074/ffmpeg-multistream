"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamInput = exports.StreamOutput = void 0;
const net_1 = __importDefault(require("net"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let counter = 0;
class UnixStream {
    constructor(stream, onSocket) {
        if (process.platform === 'win32') {
            const pipePrefix = '\\\\.\\pipe\\';
            const pipeName = `node-webrtc.${++counter}.sock`;
            this.socketPath = path_1.default.join(pipePrefix, pipeName);
            this.url = this.socketPath;
        }
        else {
            this.socketPath = './' + (++counter) + '.sock';
            this.url = 'unix:' + this.socketPath;
        }
        try {
            fs_1.default.statSync(this.socketPath);
            fs_1.default.unlinkSync(this.socketPath);
        }
        catch (err) { }
        const server = net_1.default.createServer(onSocket);
        stream.on('close', () => {
            server.close();
        });
        server.listen(this.socketPath);
    }
}
function StreamInput(stream) {
    return new UnixStream(stream, socket => stream.pipe(socket));
}
exports.StreamInput = StreamInput;
function StreamOutput(stream) {
    return new UnixStream(stream, socket => socket.pipe(stream));
}
exports.StreamOutput = StreamOutput;
