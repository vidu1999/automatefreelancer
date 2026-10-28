import { z } from 'zod';

export const marketplaces = [
  { name:'Fiverr', url:'https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig', policy:'https://help.fiverr.com/hc/en-us/articles/32242973123985-Our-Community-Standards', note:'Create and edit gigs on desktop. Unauthorized access and scraping are prohibited.', api:'Listing API not verified; manual submission only.' },
  { name:'Upwork', url:'https://developer.upwork.com/', policy:'https://support.upwork.com/hc/en-us/articles/43342677368467-Use-bots-and-other-automation-properly', note:'Approved API key and use-case permissions are required. Eligibility restrictions apply.', api:'Listing creation not verified; manual submission only.' },
  { name:'Freelancer.com', url:'https://developers.freelancer.com/', policy:'https://www.freelancer.com/about/terms', note:'Official API exists; advertised primarily for hiring. Seller listing capabilities not verified.', api:'Manual submission only.' },
  { name:'PeoplePerHour', url:'https://www.peopleperhour.com/static/manual', policy:'https://www.peopleperhour.com/static/terms', note:'Review current terms and offer requirements before submission.', api:'Public listing API not verified; manual submission only.' },
  { name:'Contra', url:'https://contra.com/features/mcp', policy:'https://contra.com/policies/terms', note:'Official MCP exists, but listing creation permissions have not been verified or tested here.', api:'Manual submission only.' }
] as const;
export const draftSchema = z.object({ title:z.string().trim().min(1).max(200), marketplace:z.enum(['Fiverr','Upwork','Freelancer.com','PeoplePerHour','Contra']), description:z.string().max(12000), packages:z.string().max(6000), requirements:z.string().max(4000), faq:z.string().max(6000), tags:z.string().max(1000), portfolio:z.string().max(4000) });
export type Draft = z.infer<typeof draftSchema>;
export const opportunitySchema = z.object({ category:z.string().trim().min(1).max(150), buyer:z.string().max(500), problem:z.string().max(2000), evidence:z.string().trim().min(1).max(3000), source:z.url().refine(s => /^https?:\/\//i.test(s), 'Use an HTTP(S) source URL'), observed:z.iso.date(), confidence:z.coerce.number().int().min(1).max(5) });
export function compliance(draft: Draft): string[] {
 const text = Object.values(draft).join(' ').toLowerCase(); const warnings:string[]=[];
 if (/guarantee[ds]?|guaranteed|100% success|#1 ranking/.test(text)) warnings.push('Review possible guarantees or unverifiable outcome claims.');
 if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}|https?:\/\//i.test(text)) warnings.push('Review external contact information and links against marketplace rules.');
 if (/fake reviews|buy followers|bypass captcha|hack account/.test(text)) warnings.push('Potentially prohibited or unauthorized service: review before proceeding.');
 if (!draft.description.trim() || !draft.packages.trim() || !draft.requirements.trim() || !draft.faq.trim()) warnings.push('Description, packages, requirements or FAQs are incomplete.');
 warnings.push('Verify claims, category, pricing, delivery promises and current platform rules yourself. This check is not marketplace approval.');
 return warnings;
}
