const gdocs = require('./getGDocs')
const aws = require('./awsUpload')
const goath = require('./googleOAuth')
const file = require('./fileIO')
const {default: PQueue} = require('p-queue')

let numFilesTotal

const run = async () => {
  await gdocs.getOAuth2Client()
  await aws.awsAuth()
  //await file.write(gdocs.getGPaths(), './data/gFiles.json')

  const queue = new PQueue({concurrency: 10})

  queue.on('add', () => {
    console.log(`Task is added.  Size: ${queue.size}  Pending: ${queue.pending}`);
  })
  queue.on('next', () => {
    console.log(`Task is completed.  Size: ${queue.size}  Pending: ${queue.pending}`);
  })

  const allfiles = await file.read('./data/sampleData.json')
  numFilesTotal = allfiles.length
  console.log(`Total number of fies in gDrive to backup: ${numFilesTotal}`)

  allfiles.map(file => {
    queue.add(() => gdocs.getGFiles(file))
  })
}

run()