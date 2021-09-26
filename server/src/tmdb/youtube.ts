import { google } from 'googleapis'
import { APIKEY_GOOGLE } from './config'

const youtube = google.youtube({
  version: 'v3',
  auth: APIKEY_GOOGLE
})

youtube.search.list({ part: ['snippet'], q: 'All american' }).then(list => {
  console.log(list)
  console.log('============================================')
  console.log('============================================')
  console.log(list.data.items)
  console.log('============================================')
  console.log('============================================')
  list.data.items.forEach(item => console.log(item))
})
