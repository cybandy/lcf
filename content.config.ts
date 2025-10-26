import { defineCollection, z } from '@nuxt/content'

const variantEnum = z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link'])
const colorEnum = z.enum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'])
const sizeEnum = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])
const orientationEnum = z.enum(['vertical', 'horizontal'])

const createBaseSchema = () => z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty()
})

const createFeatureItemSchema = () => createBaseSchema().extend({
  icon: z.string().nonempty().editor({ input: 'icon' }),
  to: z.string().optional(),
  orientation: orientationEnum.optional(),
})

const createLinkSchema = () => z.object({
  label: z.string().nonempty(),
  to: z.string().nonempty(),
  icon: z.string().optional().editor({ input: 'icon' }),
  size: sizeEnum.optional(),
  trailing: z.boolean().optional(),
  target: z.string().optional(),
  color: colorEnum.optional(),
  variant: variantEnum.optional()
})

const createImageSchema = () => z.object({
  src: z.string().nonempty().editor({ input: 'media' }),
  alt: z.string().optional(),
  loading: z.string().optional(),
  srcset: z.string().optional()
})

const createSectionBaseSchema = () => createBaseSchema().extend({
  headline: z.string(),
  links: z.array(createLinkSchema()),
  orientation: orientationEnum.optional(),
  reverse: z.boolean().optional(),
  icon: z.string().optional().editor({ input: 'icon' }),
})

export const collections = {
  index: defineCollection({
    source: '0.index.yml',
    type: 'page',
    schema: z.object({
      hero: createSectionBaseSchema().extend({
        bg_image: createImageSchema()
      }),
      sections: z.array(
        createSectionBaseSchema().extend({
          features: z.array(createFeatureItemSchema()),
          icon: z.string().optional()
        })
      ),
      features: createSectionBaseSchema().extend({
        items: z.array(createFeatureItemSchema().extend({
          image: createImageSchema(),
          variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'naked']),
          reverse: z.boolean().optional().default(true)
        }))
      }),
      testimonials: createBaseSchema().extend({
        headline: z.string().optional(),
        items: z.array(
          z.object({
            quote: z.string().nonempty(),
            user: z.object({
              name: z.string().nonempty(),
              description: z.string().nonempty(),
              to: z.string().nonempty(),
              target: z.string().nonempty(),
              avatar: createImageSchema()
            })
          })
        )
      }),
      cta: createBaseSchema().extend({
        links: z.array(createLinkSchema())
      })
    })
  }),
  blog: defineCollection({
    source: '3.blog.yml',
    type: 'page'
  }),
  posts: defineCollection({
    source: '3.blog/**/*',
    type: 'page',
    schema: z.object({
      image: z.object({ src: z.string().nonempty().editor({ input: 'media' }) }),
      authors: z.array(
        z.object({
          name: z.string().nonempty(),
          to: z.string().nonempty(),
          avatar: z.object({ src: z.string().nonempty().editor({ input: 'media' }) })
        })
      ),
      date: z.date(),
      badge: z.object({ label: z.string().nonempty() })
    })
  }),
  // changelog: defineCollection({
  //   source: '4.changelog.yml',
  //   type: 'page'
  // }),
  // versions: defineCollection({
  //   source: '4.changelog/**/*',
  //   type: 'page',
  //   schema: z.object({
  //     title: z.string().nonempty(),
  //     description: z.string(),
  //     date: z.date(),
  //     image: z.string()
  //   })
  // })
}
