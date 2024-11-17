const test = require('tape')
const ffmpeg = require('fluent-ffmpeg')
const { StreamInput, StreamOutput } = require('./../')
const { Writable, Readable, PassThrough } = require('stream')
const fs = require('fs')

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

test('cleanup', function (t) {
  t.end()
  process.exit(0)
})