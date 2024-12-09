import { MicroCMSDate } from 'microcms-js-sdk'
import { Tag } from './tag'

export type Blog = {
  id: string
  title: string
  content: string
  description: string
  kv: string
  tags: Tag[]
} & MicroCMSDate
