import { createClient } from 'microcms-js-sdk'

export const client = createClient({
  serviceDomain: 'yanagiya',
  apiKey: process.env.API_KEY,
})
