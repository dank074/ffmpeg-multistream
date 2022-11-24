# fluent-ffmpeg-multistream

This is a fork of https://github.com/t-mullen/fluent-ffmpeg-multistream

## Installation
```
npm install @dank074/fluent-ffmpeg-multistream-ts
```

## Usage

```javascript
const ffmpeg = require('fluent-ffmpeg')
const { StreamInput, StreamOutput } = require('@dank074/fluent-ffmpeg-multistream-ts')

ffmpeg()
  .input(StreamInput(readableStream1).url)
  .input(StreamInput(readableStream2).url)
  .output(StreamOutput(writableStream1).url)
  .output(StreamOutput(writableStream2).url)
```

