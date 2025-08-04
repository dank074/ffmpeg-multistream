# Ffmpeg-multistream-ts

This is a fork of https://github.com/t-mullen/fluent-ffmpeg-multistream

A cross-platform Node.js utility that enables real-time data exchange between a Node.js application and an Ffmpeg process using native interprocess communication mechanisms:

- Unix Domain Sockets on Linux and macOS

- Named Pipes on Windows

Allows you to pipe data in or out of an FFmpeg process using standard Node.js `Readable` and `Writable` streams

## Features
- 🔄 Bidirectional streaming: Use `Readable` or `Writable` streams to send data to or receive data from FFmpeg. Can use as many streams as you need, you are no longer limited to a single stdout or stdin stream
- 🧩 Cross-platform: Automatically uses Unix Domain Sockets on Linux/macOS and Named Pipes on Windows.
- ⚙️ Flexible integration: Easily integrate with existing FFmpeg command-line invocations and/or `fluent-ffmpeg`.
- 🚀 No dependencies: Built using core Node.js modules.
- 🔌 Clean lifecycle management of temporary sockets/pipes
  
## Installation
```
npm install @dank074/fluent-ffmpeg-multistream-ts
```

## Usage

### Using spawned Ffmpeg process
```javascript
const { StreamInput, StreamOutput } = require('@dank074/fluent-ffmpeg-multistream-ts')
const { spawn } = require('child_process')
const { PassThrough, Readable } = require('stream')

const fetchResponse = await fetch('https://upload.wikimedia.org/wikipedia/commons/7/7f/1_California_Inbound_Route_Announcement.wav')
const input = Buffer.from(await fetchResponse.arrayBuffer())

const readableStream1 = Readable.from(input)
const readableStream2 = Readable.from(input)

const writableStream1 = new PassThrough()
const writableStream2 = new PassThrough()

const ffmpeg = spawn('ffmpeg', [
  '-i', StreamInput(readableStream1).url,
  '-i', StreamInput(readableStream2).url,
  '-map', '0:a',
  '-c:a', 'copy',
  '-f', 'wav'
  StreamOutput(writableStream1).url,
  '-map', '1:a',
  '-c:a', 'libopus',
  '-f', 'opus',
  StreamOutput(writableStream2).url
]);
```

### With fluent-ffmpeg
```javascript
const ffmpeg = require('fluent-ffmpeg')
const { StreamInput, StreamOutput } = require('@dank074/fluent-ffmpeg-multistream-ts')
const { PassThrough, Readable } = require('stream')

const fetchResponse = await fetch('https://upload.wikimedia.org/wikipedia/commons/7/7f/1_California_Inbound_Route_Announcement.wav')
const input = Buffer.from(await fetchResponse.arrayBuffer())

const readableStream1 = Readable.from(input)
const readableStream2 = Readable.from(input)

const writableStream1 = new PassThrough()
const writableStream2 = new PassThrough()

ffmpeg()
  .input(StreamInput(readableStream1).url)
  .input(StreamInput(readableStream2).url)
  .outputOtions(['-map 0:a'])
  .codec('copy')
  .format('wav')
  .output(StreamOutput(writableStream1).url)
  .outputOptions(['-map 1:a'])
  .codec('libopus')
  .format('opus')
  .output(StreamOutput(writableStream2).url)
```

