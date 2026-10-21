// Fictional café recipes: game ingredients/prices, never food-safety training.
// tags: milk drinks take a milk choice; bread dishes can be made gluten-free; meat rules out
// vegetarian customers; pies cannot be made gluten-free. Latte art ('art') is a traced gesture.
const ESPRESSO=[['grind','Grind beans',.68],['tamp','Tamp evenly',.55],['extract','Extract espresso',.64]];
const MILK=[...ESPRESSO,['steam','Texture milk',.72],['art','Pour the latte art',.6]];
const OVEN=[['preheat','Check the oven is at 200 °C',.6],['tray','Load the oven tray',.5],['bake','Time the bake',.7],['probe','Probe the centre reaches 75 °C',.62],['plate','Rest and plate',.5]];
export const WORK_RECIPES = Object.freeze([
 {id:'espresso',name:'Espresso',price:4,ingredients:{coffee:1},kind:'coffee',tags:[],steps:ESPRESSO},
 {id:'long-black',name:'Long black',price:4,ingredients:{coffee:1},kind:'coffee',tags:[],steps:[...ESPRESSO,['top','Top up with hot water',.58]]},
 {id:'flat-white',name:'Flat white',price:5,ingredients:{coffee:1,milk:1},kind:'coffee',tags:['milk'],steps:MILK},
 {id:'latte',name:'Latte',price:5,ingredients:{coffee:1,milk:1},kind:'coffee',tags:['milk'],steps:MILK},
 {id:'cappuccino',name:'Cappuccino',price:5,ingredients:{coffee:1,milk:1},kind:'coffee',tags:['milk'],steps:[...ESPRESSO,['steam','Texture milk with extra foam',.78],['art','Spoon and pour the foam',.6]]},
 {id:'black-tea',name:'Pot of tea',price:4,ingredients:{tea:1},kind:'tea',tags:[],steps:[['fill','Fill the teapot',.65],['steep','Time the steep',.6],['pour','Pour the tea',.55]]},
 {id:'chai',name:'Chai latte',price:5,ingredients:{tea:1,milk:1},kind:'tea',tags:['milk'],steps:[['steep','Brew the spiced tea',.6],['steam','Texture milk',.72],['pour','Pour the chai',.55]]},
 {id:'eggs-toast',name:'Eggs on toast',price:13,ingredients:{eggs:2,bread:1},kind:'food',tags:['bread'],steps:[['prep','Crack eggs and prepare toast',.5],['cook','Time the eggs',.67],['plate','Plate breakfast',.55]]},
 {id:'vegie-toastie',name:'Vegetable toastie',price:12,ingredients:{bread:2,veg:1},kind:'food',tags:['bread'],steps:[['prep','Assemble the toastie',.55],['cook','Toast until golden',.65],['plate','Slice and plate',.5]]},
 {id:'egg-roll',name:'Egg and vegie roll',price:10,ingredients:{bread:1,eggs:1,veg:1},kind:'food',tags:['bread'],steps:[['prep','Split and fill the roll',.55],['cook','Fry the egg',.66],['plate','Wrap and plate',.5]]},
 {id:'big-breakfast',name:'Big breakfast',price:18,ingredients:{eggs:2,bread:2,veg:1},kind:'food',tags:['bread'],steps:[['prep','Prepare eggs, toast and vegetables',.5],['cook','Cook everything to time',.68],['assemble','Arrange the plate',.6],['plate','Garnish and plate',.55]]},
 {id:'garden-salad',name:'Garden salad',price:9,ingredients:{veg:2},kind:'food',tags:[],steps:[['prep','Wash and cut the vegetables',.55],['plate','Dress and plate',.55]]},
 {id:'pie',name:'Meat pie',price:9,ingredients:{pie:1},kind:'oven',tags:['meat','no-gf'],steps:OVEN},
 {id:'pie-salad',name:'Pie with salad',price:13,ingredients:{pie:1,veg:1},kind:'oven',tags:['meat','no-gf'],steps:OVEN}
]);
// Milk and bread choices. Plant milks and gluten-free bread come from the café pantry.
export const MILKS=['full cream','skim','oat','soy'];
export const BREADS=['regular','gluten-free'];
export const PANTRY={oat:{name:'oat milk',price:2},soy:{name:'soy milk',price:2},gf:{name:'gluten-free bread',price:3}};
export const SURCHARGE={oat:1,soy:1,'gluten-free':2};
export const DIETS=[null,null,null,null,null,null,'vegetarian','gluten-free','dairy-free','vegetarian'];
export const recipeFor=id=>WORK_RECIPES.find(r=>r.id===id);
export const CAFE_TABLES=[[-4.2,2.8],[-1.6,2.8],[-4.2,-.8],[-1.6,-.8],[1.6,2.8],[4.2,2.8]];
export const STORE_GOODS={coffee:{name:'Coffee',zone:'dry',colour:0x9d6542},tea:{name:'Tea',zone:'dry',colour:0x639354},bread:{name:'Bread',zone:'bakery',colour:0xe4b76e},milk:{name:'Milk',zone:'chilled',colour:0xe7edf4},eggs:{name:'Eggs',zone:'chilled',colour:0xd1b892}};
