// Fictional café recipes: game ingredients/prices, never food-safety training.
export const WORK_RECIPES = Object.freeze([
 {id:'flat-white',name:'Flat white',price:5,ingredients:{coffee:1,milk:1},kind:'coffee',steps:[['grind','Grind beans',.68],['tamp','Tamp evenly',.55],['extract','Extract espresso',.64],['steam','Texture milk',.72],['pour','Pour a rosetta',.52]]},
 {id:'espresso',name:'Espresso',price:4,ingredients:{coffee:1},kind:'coffee',steps:[['grind','Grind beans',.68],['tamp','Tamp evenly',.55],['extract','Extract espresso',.64]]},
 {id:'eggs-toast',name:'Eggs on toast',price:13,ingredients:{eggs:2,bread:1},kind:'food',steps:[['prep','Crack eggs and prepare toast',.5],['cook','Time the eggs',.67],['plate','Plate breakfast',.55]]},
 {id:'vegie-toastie',name:'Vegetable toastie',price:12,ingredients:{bread:2,veg:1},kind:'food',steps:[['prep','Assemble the toastie',.55],['cook','Toast until golden',.65],['plate','Slice and plate',.5]]},
 {id:'pie',name:'Meat pie',price:9,ingredients:{pie:1},kind:'oven',steps:[['tray','Load the oven tray',.5],['bake','Time the bake',.7],['plate','Plate the pie',.5]]},
 {id:'black-tea',name:'Pot of tea',price:4,ingredients:{tea:1},kind:'tea',steps:[['fill','Fill the teapot',.65],['steep','Time the steep',.6],['pour','Pour the tea',.55]]}
]);
export const recipeFor=id=>WORK_RECIPES.find(r=>r.id===id);
export const CAFE_TABLES=[[-4.2,2.8],[-1.6,2.8],[-4.2,-.8],[-1.6,-.8],[1.6,2.8],[4.2,2.8]];
export const STORE_GOODS={coffee:{name:'Coffee',zone:'dry',colour:0x9d6542},tea:{name:'Tea',zone:'dry',colour:0x639354},bread:{name:'Bread',zone:'bakery',colour:0xe4b76e},milk:{name:'Milk',zone:'chilled',colour:0xe7edf4},eggs:{name:'Eggs',zone:'chilled',colour:0xd1b892}};
