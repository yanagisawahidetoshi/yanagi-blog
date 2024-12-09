import { MicroCMSListResponse } from 'microcms-js-sdk'
import { Main } from './Main'
import { client } from 'libs/client'
import { Blog } from 'types'

export type BlogFields = Pick<Blog, 'id' | 'title' | 'publishedAt' | 'tags' | 'content'>

export default async function Page() {
  const data = await client.get<MicroCMSListResponse<BlogFields>>({
    endpoint: 'blog',
    queries: {
      limit: 5,
    },
  })
  const posts = data.contents

  return <Main posts={posts} />
}
