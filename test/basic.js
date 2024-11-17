const test = require('tape')
const ffmpeg = require('fluent-ffmpeg')
const { StreamInput, StreamOutput } = require('./../')
const { Writable, Readable, PassThrough } = require('stream')
const fs = require('fs')
const { createConnection } = require("node:net")

test('two outputs', function (t) {
  t.plan(2)

  const ws1 = new Writable()
  ws1._write = () => {
    ws1._write = () => {}
    t.pass('got data on ws1')
  }

  const ws2 = new Writable()
  ws2._write = () => {
    ws2._write = () => {}
    t.pass('got data on ws2')
  }

  const command = ffmpeg()
    .addInput('./test/sample.webm')
    .addOutput(StreamOutput(ws1).url)
    .addOutputOption('-f mpegts')
    .addOutput(StreamOutput(ws2).url)
    .addOutputOption('-f mpegts')
    .on('error', (err) => { t.fail('ffmpeg failed: ' + err)})

  command.run()
})

test('two inputs, two outputs', function (t) {
  t.plan(2)

  const rs1 = fs.createReadStream('./test/sample.webm')
  const rs2 = fs.createReadStream('./test/sample.webm')

  const ws1 = new Writable()
  ws1._write = () => {
    ws1._write = () => {}
    t.pass('got data on ws1')
  }

  const ws2 = new Writable()
  ws2._write = () => {
    ws2._write = () => {}
    t.pass('got data on ws2')
  }

  const command = ffmpeg()
    .addInput(StreamInput(rs1).url)
    .addInput(StreamInput(rs2).url)
    .output(StreamOutput(ws1).url)
    .addOutputOption('-f mpegts')
    .output(StreamOutput(ws2).url)
    .addOutputOption('-f mpegts')
    .on('error', (err) => {
      t.fail('ffmpeg failed: ' + err);
    })

  command.run()
})

test('one Audio input, copy Audio codec, verify output matches input', function (t) {
  t.plan(1)

  const rs1 = fs.createReadStream('./test/sample2.wav')
  const originalFile = fs.readFileSync('./test/sample2.wav')
  const chunks = []
  const outputStream = new PassThrough()

  outputStream.on('data', (data) => {
    chunks.push(data)
  })

  const command = ffmpeg()
    .addInput(StreamInput(rs1).url)
    .on('start', console.log)
    .on('error', (err) => {t.fail('ffmpeg failed: ' + err)})
    .on('stderr', console.error)
    .on('end', () => {
      const buffer = Buffer.concat(chunks)

      const difference = buffer.length - originalFile.length;
      if(difference === 0) t.pass("input and output files match")
      else t.fail(`Input and output do not match: ${difference} bytes difference`)
    })
    .audioCodec('copy')
    .format('wav')
    .output(outputStream);

    command.run();
})

test('Test loss of data in StreamInput', function (t) {
  t.plan(1)

  const stream = fs.createReadStream('./test/sample2.wav')
  const originalFile = fs.readFileSync('./test/sample2.wav')
  const chunks = []

  const socket = StreamInput(stream)
  const client = createConnection(socket.socketPath);

  client.on("data", (data) => chunks.push(data))
  client.on("error", () => {t.fail(`Error connecting to socket: ${socket.socketPath}`)})
  client.on("end", () => {
      const buffer = Buffer.concat(chunks)
      const difference = buffer.length - originalFile.length;
      if(difference === 0) t.pass(`input and output match: ${buffer.length} bytes`)
      else t.fail(`Input and output does not match: ${difference} bytes difference`)
  })
})

test('Test loss of data in StreamOutput', function(t) {
  t.plan(1)

  const originalFile = fs.readFileSync('./test/sample2.wav')
  const chunks = []
  const output = new PassThrough()

  output.on('data', (data) => chunks.push(data))

  
  output.on("end", () => {
    const buffer = Buffer.concat(chunks)
    const difference = buffer.length - originalFile.length;
    if(difference === 0) t.pass(`input and output match: ${buffer.length} bytes`)
    else t.fail(`Input and output does not match: ${difference} bytes difference`)
  })

  const socket = StreamOutput(output)
  const client = createConnection(socket.socketPath);

  client.on("connect", () => {
    client.write(originalFile)
    client.end()
  })
  client.on("error", () => {t.fail(`Error connecting to socket: ${socket.socketPath}`)})
})

test('cleanup', function (t) {
  t.end()
  process.exit(0)
})