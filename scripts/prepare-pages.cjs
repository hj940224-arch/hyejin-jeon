const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'site'),target=path.join(root,'_site');
const supplied=process.env.PUBLIC_SITE_URL;if(!supplied)throw new Error('PUBLIC_SITE_URL is required.');
const url=new URL(supplied);if(url.protocol!=='https:')throw new Error('Use an HTTPS public URL.');const base=url.href.replace(/\/$/,'');
fs.mkdirSync(target,{recursive:true});fs.cpSync(source,target,{recursive:true});let html=fs.readFileSync(path.join(target,'index.html'),'utf8');
html=html.replaceAll('http://localhost:4174',base).replace('<!-- Social preview: replace localhost with the public origin when deploying. -->','<!-- Public sharing metadata generated for GitHub Pages. -->');
html=html.replace('</head>',`<link rel="canonical" href="${base}/"><meta property="og:url" content="${base}/"></head>`);
if(/localhost|D:\\A_PP/.test(html))throw new Error('A local-only URL remains in the public HTML.');
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const ref=m[1];if(/^(?:https?:|data:|mailto:)/.test(ref))continue;const clean=decodeURIComponent(ref.split('?')[0]);if(!fs.existsSync(path.join(target,clean)))throw new Error('Missing asset: '+clean);}
fs.writeFileSync(path.join(target,'index.html'),html);fs.writeFileSync(path.join(target,'.nojekyll'),'');
fs.writeFileSync(path.join(target,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
fs.writeFileSync(path.join(target,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc></url></urlset>`);
console.log('Verified public site and sharing metadata for '+base+'/');
