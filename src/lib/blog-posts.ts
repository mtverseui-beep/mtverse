export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  isoDate: string
  readTime: string
  category: string
  intro: string
  sections: Array<{
    heading: string
    body: string[]
    bullets?: string[]
  }>
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-midjourney-prompts-2026',
    title: 'The Best Midjourney Prompts for Stunning AI Art in 2026',
    excerpt:
      'A practical guide to prompt structure, camera language, style control, and iteration patterns for more reliable AI image results.',
    date: 'March 1, 2026',
    isoDate: '2026-03-01',
    readTime: '8 min read',
    category: 'AI Prompts',
    intro:
      'Good image prompts are not just long descriptions. The most reliable prompts describe intent, subject, composition, lighting, style, constraints, and the final use case in a way the model can prioritize.',
    sections: [
      {
        heading: 'Start With A Clear Visual Job',
        body: [
          'Before adding style words, define what the image needs to do. A product image needs clarity and recognizable details. A poster needs hierarchy and negative space. A portrait needs pose, lens, skin texture, and emotional direction.',
          'This gives the model a practical target instead of a pile of aesthetic tags. It also makes the result easier to judge: either the image performs the job or it does not.',
        ],
        bullets: [
          'Subject: who or what is in the image',
          'Scene: where the image takes place',
          'Composition: framing, angle, and aspect ratio',
          'Lighting: time of day, source, contrast, and mood',
          'Output: poster, editorial photo, product render, icon, or concept art',
        ],
      },
      {
        heading: 'Use Camera And Lighting Language',
        body: [
          'Camera language is useful because it is specific. Phrases such as "85mm portrait lens", "low angle product shot", "soft window light", and "high contrast rim light" tell the model how the image should feel physically.',
          'Lighting is often more important than style. The same subject can become cinematic, documentary, commercial, or playful simply by changing light direction and contrast.',
        ],
      },
      {
        heading: 'Keep Style References Controlled',
        body: [
          'It is tempting to stack many style references into one prompt. That usually produces mixed results. Pick one dominant style direction, then add two or three supporting constraints.',
          'For example, "minimal editorial product photography" is stronger than combining editorial, cyberpunk, watercolor, cinematic, luxury, vintage, and hyperrealistic in one instruction.',
        ],
      },
      {
        heading: 'Iterate With Small Changes',
        body: [
          'When a prompt is close, change one variable at a time: crop, camera angle, background, lighting, or color palette. This makes each generation teach you something.',
          'A useful prompt library should preserve these decisions. mtverse prompts are written so creators can copy the base idea, replace variables, and reuse the structure for many projects.',
        ],
      },
    ],
  },
  {
    slug: 'react-component-architecture',
    title: 'Building Scalable React Component Architecture with TypeScript',
    excerpt:
      'The architecture choices behind reusable UI: component boundaries, typed props, composition, states, accessibility, and source organization.',
    date: 'February 15, 2026',
    isoDate: '2026-02-15',
    readTime: '12 min read',
    category: 'Engineering',
    intro:
      'A component library becomes valuable when teams can understand it quickly, customize it safely, and trust it across many screens. That requires more than attractive visuals.',
    sections: [
      {
        heading: 'Separate Display From Behavior',
        body: [
          'A production component should make state ownership obvious. Simple components can be fully controlled by props. Complex components can expose callbacks and keep only temporary UI state internally.',
          'This separation helps teams reuse the same visual system in dashboards, marketing pages, admin screens, and product workflows without rewriting behavior for every use case.',
        ],
      },
      {
        heading: 'Prefer Composition Over Large Props',
        body: [
          'Large prop objects become difficult to document and easy to misuse. Composition keeps the API readable. A card can accept children, a table can accept column definitions, and a modal can expose header/body/footer regions.',
          'This pattern is also friendlier to accessibility because labels, descriptions, buttons, and live regions stay close to the markup where they are used.',
        ],
      },
      {
        heading: 'Document States, Not Only The Happy Path',
        body: [
          'Real products need loading, empty, error, disabled, hover, focus, and mobile states. A library that only shows the perfect filled state is not production-ready.',
          'When building mtverse UI previews, each component is curated to show useful states without rendering an entire dashboard on every page.',
        ],
        bullets: [
          'Loading and skeleton states',
          'Empty and zero-data states',
          'Validation and error states',
          'Keyboard focus states',
          'Responsive layout behavior',
        ],
      },
      {
        heading: 'Keep Source Files Discoverable',
        body: [
          'Professional UI libraries usually store component source in a registry-like structure. Metadata describes the slug, category, title, access level, dependencies, and preview component.',
          'This lets the public site render a fast gallery while source pages fetch only the selected component code after checking access permissions.',
        ],
      },
    ],
  },
  {
    slug: 'chatgpt-writing-prompts',
    title: '50 ChatGPT Writing Prompts That Actually Produce Great Content',
    excerpt:
      'How to write prompts that produce specific, useful writing instead of generic AI output.',
    date: 'February 1, 2026',
    isoDate: '2026-02-01',
    readTime: '6 min read',
    category: 'AI Prompts',
    intro:
      'The best writing prompts give the model context, audience, constraints, voice, and a review checklist. Without those pieces, the output often sounds polished but vague.',
    sections: [
      {
        heading: 'Define The Reader First',
        body: [
          'Writing improves when the audience is specific. "Write a product update" is weak. "Write a product update for SaaS founders who care about faster onboarding" gives the model a useful target.',
          'Audience context changes examples, vocabulary, objections, and the level of explanation. It also reduces filler because the model knows what the reader already understands.',
        ],
      },
      {
        heading: 'Give A Voice Model',
        body: [
          'Voice does not need to imitate a person. It can be described as concise, helpful, practical, confident, warm, technical, plainspoken, or editorial.',
          'Combine voice with forbidden patterns. For example: "Use short paragraphs. Avoid hype, cliches, and exaggerated claims." This keeps the result more human and easier to edit.',
        ],
      },
      {
        heading: 'Ask For Structure And Revision',
        body: [
          'For blog posts, landing copy, emails, and documentation, ask for an outline first. Then ask for a draft, then a revision pass for clarity and specificity.',
          'This staged approach produces better writing because the model has a chance to organize ideas before generating final copy.',
        ],
      },
      {
        heading: 'Use Prompt Variables',
        body: [
          'Reusable prompts work best when they include variables such as product, audience, tone, format, goal, and constraints. That is why mtverse prompt cards focus on structured copy-ready prompts rather than one-off examples.',
        ],
      },
    ],
  },
  {
    slug: 'tailwind-css-design-system',
    title: 'Creating a Design System with Tailwind CSS v4 and shadcn/ui',
    excerpt:
      'A practical approach to tokens, spacing, radius, component states, and dark mode for a coherent Tailwind design system.',
    date: 'January 20, 2026',
    isoDate: '2026-01-20',
    readTime: '10 min read',
    category: 'Engineering',
    intro:
      'A design system is not a color palette. It is a set of decisions that keeps product screens consistent even when many components are built over time.',
    sections: [
      {
        heading: 'Start With Tokens',
        body: [
          'Tokens make the system flexible. Use variables for background, foreground, border, primary, muted, destructive, radius, and shadow. Then components can adapt to light and dark themes without duplicating classes everywhere.',
          'Tailwind works well for this because utility classes can reference those variables while still keeping markup readable.',
        ],
      },
      {
        heading: 'Choose Radius And Shadow Rules Early',
        body: [
          'Inconsistent radius and shadow are easy to notice. Decide what cards, buttons, panels, and modals should use. Keep repeated item cards restrained and avoid stacking cards inside cards.',
          'A cleaner system usually feels more premium than one with heavy shadows and exaggerated corners.',
        ],
      },
      {
        heading: 'Build Component States Into The Preview',
        body: [
          'A button page should show size, variant, disabled, icon-only, and loading states. A table page should show sorting, empty rows, and status indicators. This makes the library useful for real product work.',
        ],
      },
      {
        heading: 'Document Integration Assumptions',
        body: [
          'Every copyable component should make dependencies clear: React, TypeScript, Tailwind, icons, Radix primitives, or local utilities. This reduces confusion and support requests.',
        ],
      },
    ],
  },
  {
    slug: 'flux-image-generation-guide',
    title: 'The Complete Guide to Flux AI Image Generation',
    excerpt:
      'Prompting patterns for photorealistic Flux images, product scenes, editorial portraits, and visual consistency.',
    date: 'January 5, 2026',
    isoDate: '2026-01-05',
    readTime: '9 min read',
    category: 'AI Prompts',
    intro:
      'Flux responds well to precise scene direction. The strongest prompts describe subject identity, environment, lens, lighting, material detail, and what should be avoided.',
    sections: [
      {
        heading: 'Use Physical Detail',
        body: [
          'Instead of saying "high quality", describe what quality means: natural skin texture, soft fabric folds, realistic reflections, clean product edges, or believable depth of field.',
          'Physical detail gives the model something concrete to render and gives you a better way to evaluate the output.',
        ],
      },
      {
        heading: 'Control The Background',
        body: [
          'Backgrounds often decide whether an image looks professional. For portraits, use simple rooms, streets, studios, or natural locations. For products, use surface material, color temperature, and shadow behavior.',
        ],
      },
      {
        heading: 'Add Negative Direction Carefully',
        body: [
          'Negative prompts are useful when they remove common failures such as extra limbs, distorted text, harsh plastic skin, duplicate objects, or unreadable labels.',
          'They should not become longer than the main prompt. Too many negative constraints can confuse the output.',
        ],
      },
      {
        heading: 'Save Working Patterns',
        body: [
          'When a prompt works, save the structure. Change only the variable fields for the next image. This turns one successful generation into a repeatable workflow.',
        ],
      },
    ],
  },
  {
    slug: 'nextjs-16-features',
    title: "What's New in Next.js 16: A Practical Overview",
    excerpt:
      'A practical look at App Router workflows, metadata, performance expectations, and production checks for modern Next.js projects.',
    date: 'December 15, 2025',
    isoDate: '2025-12-15',
    readTime: '7 min read',
    category: 'Engineering',
    intro:
      'Next.js continues to push more work toward server rendering, streaming, and route-level decisions. The biggest production wins still come from clean data boundaries and careful client bundles.',
    sections: [
      {
        heading: 'Keep Client Components Small',
        body: [
          'A useful rule is simple: make a component client-side only when it needs browser state, events, local storage, media APIs, or animation hooks.',
          'Server components are better for metadata, data loading, permissions, and content pages. This keeps public pages faster and easier for crawlers to evaluate.',
        ],
      },
      {
        heading: 'Use Metadata Per Route',
        body: [
          'Every important route should have a clear title, description, canonical URL, and Open Graph data. Prompt detail pages and component detail pages should be indexable only when the content is unique and useful.',
        ],
      },
      {
        heading: 'Treat Build Errors As Real Errors',
        body: [
          'Production builds should not ignore TypeScript errors. If a project needs to exclude generated examples or downloadable packages, exclude those folders intentionally rather than hiding all type failures.',
        ],
      },
      {
        heading: 'Measure The Public Experience',
        body: [
          'For sites that depend on search and AdSense approval, public pages matter most. Navigation should work, pages should be crawlable, images should load reliably, and content should explain why the page exists.',
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
