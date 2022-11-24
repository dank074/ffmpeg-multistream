/// <reference types="node" />
/// <reference types="node" />
import net from 'net';
import stream from 'stream';
declare class UnixStream {
    url: string;
    socketPath: string;
    constructor(stream: stream.Stream, onSocket: ((socket: net.Socket) => void) | undefined);
}
declare function StreamInput(stream: stream.Readable): UnixStream;
declare function StreamOutput(stream: stream.Writable): UnixStream;
export { StreamOutput, StreamInput };
