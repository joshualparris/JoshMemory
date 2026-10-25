// Public-only museum interpretations of four otherwise private project houses.
// Do not import private brief text or repo identities into the public replacement.
const HOMES = {
 A3: {name:'Elizabeth Farm',guide:'Mara Ellery',style:'cottage',kind:'Colonial Australian homestead museum',colour:[0xd0b38e,0x6f5a45,0xe8decb],layout:'hub',
  url:'https://mhnsw.au/visit-us/elizabeth-farm/',detail:'https://www.nsw.gov.au/visiting-and-exploring-nsw/locations-and-attractions/elizabeth-farm',
  intro:'Australia’s oldest surviving European homestead, established in 1793 for John and Elizabeth Macarthur; this scale model evokes its broad verandahs, period rooms and garden, rather than claiming survey accuracy.',
  rooms:[
   ['Verandah and Colonial Entrance','Wide verandahs frame the early bungalow and its garden.', ['bench','lantern','pottedTree']],
   ['Macarthur Sitting Room','The early colonial rooms contain period household furnishings, fireplace and family correspondence.',['fireplace','sofa','table','bookshelf']],
   ['Dining and Kitchen','Food, dining, domestic service and kitchen labour were part of the household’s history.',['table','chair','cabinet','fireplace']],
   ['Kitchen Garden','The restored garden evokes the 1830s landscape around the historic farm.',['plant','pottedTree','bench','shelf']]
  ]},
 N3: {name:'Monticello',guide:'Theo Mercer',style:'mansion',kind:'Jeffersonian neoclassical house museum',colour:[0xa65a41,0x77716d,0xf5eee0],layout:'grid',
  url:'https://www.monticello.org/what-is-monticello/an-iconic-house/rooms-furnishings',detail:'https://www.monticello.org/what-is-monticello/an-iconic-house/house',
  intro:'Schematic interpretation of Thomas Jefferson’s neoclassical Monticello, its portico, dome and documented interior rooms. Its history includes enslaved workers and families; this recreation does not replicate the original floor plan.',
  rooms:[
   ['Entrance Hall','The entrance hall displayed natural-history specimens and maps.',['bench','globe','clock','noticeBoard']],
   ['Library and Cabinet','Jefferson’s Book Room, Cabinet and other study spaces reflect reading, science and correspondence.',['bookshelf','desk','globe','lamp']],
   ['Parlor','The furnished parlor includes seating, artworks and refined interior details.',['sofa','rug','fireplace','piano']],
   ['Dining and Tea Room','The dining and tea rooms supported meals and social occasions, with service by enslaved workers.',['table','chair','cabinet','clock']]
  ]},
 T2: {name:'Vaucluse House',guide:'Sadie Wren',style:'castle',kind:'Gothic revival Sydney estate museum',colour:[0xd7c7a8,0x66636a,0xf0e6d6],layout:'L',
  url:'https://mhnsw.au/visit-us/vaucluse-house/',detail:'https://mhnsw.au/visit-us/vaucluse-house/plan-your-visit/',
  intro:'Scaled interpretation of Vaucluse House, a picturesque Gothic nineteenth-century residence with reception rooms, kitchen wing, stables, gardens and original Wentworth family associations.',
  rooms:[
   ['Entrance and Estate Story','Sarah and William Charles Wentworth lived here with their large family; the museum also explains the work of servants.',['noticeBoard','bench','clock','plant']],
   ['Drawing Room','The richly furnished entertaining rooms expressed the aspirations of the Wentworth household.',['piano','sofa','rug','fireplace']],
   ['Dining Room','Formal dining spaces and their furnishings are documented in the official museum virtual tour.',['table','chair','cabinet','clock']],
   ['Kitchen Wing and Garden','The surviving kitchen, laundry, stables and kitchen garden reveal domestic work at the estate.',['workbench','fireplace','shelf','plant']]
  ]},
 I7: {name:'Fallingwater',guide:'Edgar Lane',style:'modern',kind:'Modernist architectural landmark museum',colour:[0xa29a85,0xcbb78d,0xdfd1af],layout:'hub',
  url:'https://fallingwater.org/fallingwater/',detail:'https://franklloydwright.org/site/fallingwater/',
  intro:'A scaled interpretation of Frank Lloyd Wright’s 1935 Kaufmann family house: horizontal cantilever terraces, local stone, open living/dining spaces and a hearth rooted in the rocky site above Bear Run.',
  rooms:[
   ['Stone Hearth Living Room','The fireplace incorporates natural stone; Wright connected living spaces with the landscape.',['fireplace','sofa','rug','table']],
   ['Open Dining Area','The original first-floor living and dining spaces are continuous rather than separated by formal doorways.',['table','chair','lamp','plant']],
   ['Cantilever Terrace','Horizontal reinforced-concrete platforms reach over the stream and forest setting.',['bench','pottedTree','rock','lantern']],
   ['Bedroom and Private Terrace','Upper-storey bedroom suites have outdoor terraces; this room is only a schematic stand-in.',['bed','wardrobe','desk','lamp']]
  ]}
};
export const HERITAGE_COORDINATES = Object.keys(HOMES);
export const HERITAGE_LABELS = Object.fromEntries(Object.entries(HOMES).map(([k,v])=>[k,v.name]));
export const HERITAGE_GUIDES = Object.fromEntries(Object.entries(HOMES).map(([k,v])=>[k,v.guide]));
export function publicHeritageHouse(house) {
 const spec=HOMES[house.coordinate]; if(!spec)return house;
 const [walls,roof,trim]=spec.colour;
 const intro='Fictional museum interpreter; the historic house and room details come from the linked institution.';
 const rooms=spec.rooms.map(([name,description,types],i)=>({
   name,w:10,d:9,props:[
     ...types.map((type,j)=>[type, j===0 ? name+' exhibit' : undefined, j===0
       ? {do:'link',title:name,text:description,url:i===0?spec.url:spec.detail,button:'Read the official reference'} : undefined]),
     ...(i===0 ? [['resident','Talk to '+spec.guide,{do:'npc',title:spec.guide,name:spec.guide,at:'center',c:walls,a:trim,text:intro}]] : []),
     ...(i===spec.rooms.length-1 ? [['noticeBoard','Official historic house guide',{do:'link',title:'Official historic house guide',text:spec.intro,url:spec.url,button:'See historic property'}]]:[])
   ]}));
 return { coordinate:house.coordinate,repo:null,name:spec.name,visibility:'public',street:house.street,
   heritage:true,kind:spec.kind,summary:spec.intro,links:[
     {label:'Official museum',url:spec.url},{label:'Architecture and interiors',url:spec.detail}],
   ext:{style:spec.style,walls,roof,trim,door:0x604d3c,features:['bench','flowerbeds','lanterns']},
   int:{layout:spec.layout,floor:0xa58b6c,walls:0xe8dfce,light:0xffe7bb,doors:0x6d5743,ceiling:0xf3eee4,rooms}
 };
}
