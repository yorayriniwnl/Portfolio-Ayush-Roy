import type{Metadata}from"next";import{notFound}from"next/navigation";import{CaseStudy}from"@/components/CaseStudy";import{getProject,projects}from"@/content/projects";
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params,p=getProject(slug);if(!p)return{};return{title:p.title,description:p.purpose,alternates:{canonical:`/work/${p.slug}`},openGraph:{title:`${p.title} · Ayush Roy`,description:p.purpose}}}
export default async function WorkPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params,p=getProject(slug);if(!p)notFound();return <CaseStudy project={p}/>}
