import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { client } from 'libs/client'
import { Blog } from 'types'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

async function getBlogPost(id: string): Promise<Blog> {
  const data = await client.get({
    endpoint: `blog/${id}`,
  })
  return data
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const post = await getBlogPost(params.id)
  const authorList = ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  if (!post) {
    return
  }

  const publishedAt = post.publishedAt
  const modifiedAt = post.updatedAt
  const authors = authorDetails.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.kv) {
    imageList = typeof post.kv === 'string' ? [post.kv] : post.kv
  }
  const ogImages = post.kv

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id

  // Filter out drafts in production
  // const sortedCoreContents = allCoreContent(sortPosts(allBlogs))
  // const postIndex = sortedCoreContents.findIndex((p) => p.slug === id)
  // if (postIndex === -1) {
  //   return notFound()
  // }

  // const prev = sortedCoreContents[postIndex + 1]
  // const next = sortedCoreContents[postIndex - 1]
  const post = await getBlogPost(id)
  console.log(post)
  const authorList = ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const jsonLd = post
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* <PostLayout content={post} authorDetails={authorDetails} next={next} prev={prev}> */}
      <PostLayout content={post} authorDetails={authorDetails}>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </PostLayout>
    </>
  )
}
