const ext=globalThis.UndercityExpansions||{stories:[],items:{}};
export const project={
 game:"undercity",name:"The Undercity Studio",
 stats:["observation","guile","persuasion","resolve"],
 menaces:["suspicion","notoriety","wounds","delirium"],
 quirks:["merciful","ruthless","honest","subtle","proud","generous","curious","cautious","steadfast"],
 locations:["cell","court","ink","quays","soot","choir","market","stairs","edge","watch","ward","tribunal","the_watch_house","the_tribunal","the_ward","the_pale_rooms"],
 items:[...new Set(["brass","charcoal","silk","hook","badge","ticket","glass","ledger","moss","lure","map","relic",...Object.keys(ext.items||{})])],knownIds:(ext.stories||[]).map(x=>x.id),
 forbidden:["Fallen London","Watchful","Shadowy","Dangerous"],
 sourceInfo:"Existing stories remain in their original JavaScript and JSON packs. New approved JSON is compiled into content/cms-published.js.",
 published:(ext.stories||[]).map(s=>({id:s.id,title:s.title||s.id,location:s.where?.[0]||"court",text:s.description||"",choices:s.choices||[]}))
};