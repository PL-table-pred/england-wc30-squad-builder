export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  author_label: string | null
  cover_image_url: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogPostInput {
  id?: string | null
  slug: string
  title: string
  excerpt: string
  body: string
  author_label: string
  cover_image_url: string
  published: boolean
}
