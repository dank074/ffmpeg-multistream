import net from 'net';
import fs from 'fs';
import path from 'path';
import stream from 'stream';

let counter = 0
class UnixStream {
  public url: string;
  public socketPath: string;

  constructor (stream: stream.Stream, onSocket: ((socket: net.Socket) => void) | undefined) {
    if (process.platform === 'win32') {
      const pipePrefix = '\\\\.\\pipe\\';
      const pipeName = `node-webrtc.${++counter}.sock`;

      this.socketPath = path.join(pipePrefix, pipeName);
      this.url = this.socketPath;
    }
    else {
      this.socketPath = './' + (++counter) + '.sock'
      this.url = 'unix:' + this.socketPath
    }

    try {
      fs.statSync(this.socketPath)
      fs.unlinkSync(this.socketPath)
    } catch (err) {}
    const server = net.createServer(onSocket)
    stream.on('finish', () => {
      server.close()
    })
    server.listen(this.socketPath)
  }
}

function StreamInput (stream: stream.Readable) {
  return new UnixStream(stream, socket => stream.pipe(socket))
}

function StreamOutput (stream: stream.Writable) {
  return new UnixStream(stream, socket => socket.pipe(stream))
}
export { StreamOutput, StreamInput };
