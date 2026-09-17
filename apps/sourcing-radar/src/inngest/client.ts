import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'washpro-sourcing-radar' })

export type SourceRunEvent = {
  data: { sourceSlug: string }
}
