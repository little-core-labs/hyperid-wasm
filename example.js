const hyperid = require('./')

hyperid.ready(() => {
  const hid = hyperid({ fixedLength: true, startFrom: 1024 })
  console.log(hid()) // atd1gpRDT1SJZnaOhdLR5Q/0000001024
  console.log(hid()) // atd1gpRDT1SJZnaOhdLR5Q/0000001025
})
