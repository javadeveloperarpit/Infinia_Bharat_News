export function createSlug(title:string){

const now = new Date();


const date =
`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;


const time =
`${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}${String(now.getSeconds()).padStart(2,"0")}`;



const slug = title

.toLowerCase()

.trim()

.replace(/[^\p{L}\p{N}\s-]/gu,"")

.replace(/\s+/g,"-")

.replace(/-+/g,"-")

.replace(/^-|-$/g,"");



return `${slug}-${date}-${time}`;

}