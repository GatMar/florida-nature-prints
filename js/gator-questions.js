/**
 * Gator Life - large educational question bank (2500+)
 * Built from Florida American alligator facts + unique phrasing/choice mixes
 * so replaying a level rarely repeats the same question card.
 */
(function (global) {
  "use strict";

  const TOPICS = {
    nest: [
      ["Nest temperature decides if babies are boys or girls.", "Nest temperature", ["The moon phase", "How loud Mom is", "Egg color", "Rain amount", "Father size", "Number of leaves"]],
      ["Mother alligators often guard the nest.", "The mother alligator", ["Only raccoons", "Tourists", "Fish", "Nobody ever", "Clouds", "Deer"]],
      ["Raccoons can raid alligator nests for eggs.", "Raccoons", ["Butterflies", "Ladybugs", "Palm trees", "Seagull songs", "Moss", "Sand"]],
      ["Alligator nests are built from plants and mud.", "Plants and mud (vegetation)", ["Only plastic", "Only metal", "Snow", "Glass bottles", "Concrete only", "Cloud fluff"]],
      ["Flooding can harm alligator eggs.", "Flooding", ["Soft breezes", "Quiet nights", "Moonlight", "Gentle dew", "Starlight", "Rainbows"]],
      ["Too much heat can also stress eggs in a nest.", "Too much heat", ["Soft music", "Green leaves only", "Slow clouds", "Quiet frogs", "Shade forever", "Cool mist only"]],
      ["American alligators nest in Florida wetlands.", "Florida wetlands and marshes", ["Only mountaintops", "Only open ocean", "Arctic ice", "Deserts only", "City rooftops only", "Caves of ice"]],
      ["Eggs incubate for about two months roughly.", "About two months (roughly)", ["Two hours", "Two days only", "Twenty years", "Two minutes", "Forever", "One second"]],
      ["Mom may help hatchlings from the nest.", "The mother", ["A bus driver", "A kite", "A bicycle", "A mailbox", "A streetlamp", "A stop sign"]],
      ["Nests can hold many eggs at once.", "Many eggs", ["Only one grain of sand", "Only feathers", "Only rocks", "Only keys", "Only coins", "Only buttons"]],
    ],
    hatchling: [
      ["Baby alligators have yellow stripes for camouflage.", "Camouflage in grass and plants", ["Faster Wi-Fi", "Louder music", "Brighter neon signs", "Better backpacks", "Flying", "Ice skating"]],
      ["Hatchlings are tiny and need Mom's protection.", "Stay near Mom and hide", ["Drive cars", "Build skyscrapers", "Fly airplanes", "Cook pizza alone", "Mine diamonds", "Surf volcanoes"]],
      ["Moms may protect young about 1-2 years.", "About 1-2 years", ["Two seconds", "Forever without change", "Exactly 100 years only", "One blink", "Zero days always", "A thousand moons only"]],
      ["Birds can hunt tiny hatchlings.", "Big birds (and other predators)", ["Paper airplanes only", "Cotton balls", "Soap bubbles", "Feathers alone with no bird", "Cloud shapes", "Shadows of leaves only"]],
      ["Hatchlings call with high peeps.", "High peeps or yelps", ["Truck horns only", "Opera forever", "Silence always", "Drum kits", "Church bells only", "Train whistles only"]],
      ["Stripes fade as gators grow older.", "They fade with age", ["They turn into polka dots forever", "They become rainbow lasers", "They never change ever", "They become barcodes", "They turn into words", "They become glitter only"]],
      ["Water plants help hatchlings hide.", "Hiding among plants", ["Learning algebra only", "Watching TV", "Buying shoes", "Painting fences", "Flying kites only", "Baking cakes"]],
      ["Snakes can be a danger to hatchlings.", "Snakes (and other predators)", ["Marshmallows", "Pillows", "Blankets", "Socks", "Buttons", "Erasers"]],
      ["Hatchlings learn to swim early.", "Swim and hide", ["Pilot jets", "Drive submarines for fun only", "Race motorcycles", "Skateboard on clouds", "Climb skyscrapers alone", "Juggle cars"]],
      ["Staying in a group can help survival.", "Staying near family/group", ["Leaving Earth", "Hiding in outer space", "Becoming invisible forever magically", "Turning into frogs permanently", "Ignoring water forever", "Avoiding all shade forever"]],
    ],
    juvenile: [
      ["Young gators eat insects, frogs, and small fish.", "Insects, frogs, and small fish", ["Only metal cans", "Only coconuts always", "Only notebooks", "Only sneakers", "Only traffic cones", "Only umbrellas"]],
      ["Diet grows as the gator grows.", "Larger prey over time", ["Only air forever", "Only sunlight calories", "Only rainwater energy", "Only music notes", "Only shadows", "Only echoes"]],
      ["Gator holes hold water in dry seasons.", "Dens that hold water", ["Golf ball machines", "Vending machines", "Movie theaters only", "Elevators", "Escalators", "Ferris wheels"]],
      ["Avoid bigger alligators when small.", "Avoid much bigger gators", ["Challenge every whale", "Race every truck", "Hug every boat motor", "Chase every airplane", "Tackle every train", "Wrestle every crane"]],
      ["Wetlands provide food and cover.", "Food and cover", ["Only parking meters", "Only stop lights", "Only crosswalks", "Only billboards", "Only fire hydrants", "Only mailboxes"]],
      ["Juveniles search for safe water.", "Safe water and food", ["Only shopping malls", "Only roller coasters", "Only stadiums", "Only airports", "Only subways", "Only elevators"]],
      ["Fish are common juvenile prey.", "Small fish (and more)", ["Satellites", "Comets", "Asteroids", "Space stations", "Meteor showers", "Black holes"]],
      ["Humans and pets should keep distance.", "Give wildlife space", ["Feed every wild gator by hand", "Swim toward nests always", "Chase wildlife for photos only unsafe", "Corner wild animals", "Block their water forever", "Trap them for fun"]],
      ["Dry seasons make water holes precious.", "Water becomes limited", ["Oceans disappear forever instantly always", "Rain never existed", "Florida turns to ice permanently overnight always", "All lakes become chocolate", "Rivers become highways only", "Clouds become solid roads"]],
      ["Camouflage still helps young gators.", "Blending into habitat", ["Wearing clown shoes", "Using neon paint always", "Carrying flashlights on their heads always", "Wearing traffic vests forever", "Using disco lights", "Waving flags constantly"]],
    ],
    subadult: [
      ["Sub-adults may travel to find territory.", "Find new territory or water", ["Attend college lectures only", "Buy concert tickets only", "Collect stamps only", "Watch only cartoons forever", "Play only video games forever", "Ignore all water forever"]],
      ["Boats can be dangerous nearby.", "Avoid close boat traffic", ["Hug propellers", "Race engines underwater always", "Sleep on boat motors", "Chase every ski rope", "Bite every paddleboard always", "Block every channel on purpose"]],
      ["Gators dig dens called gator holes.", "Gator holes (dens)", ["Rocket silos", "Subway tunnels only in cities", "Ski lodges", "Igloos only", "Treehouses only in oaks always", "Sandcastles only on beaches always"]],
      ["Other animals use gator holes too.", "Other wildlife can benefit", ["Only robots", "Only drones", "Only satellites", "Only helicopters", "Only airplanes", "Only blimps"]],
      ["Crossing dry land can be risky.", "Travel carefully for water/territory", ["Fly without wings", "Teleport always", "Become invisible legally", "Turn into mist forever", "Walk on clouds safely always", "Surf on sunshine beams"]],
      ["Competition rises with size.", "Compete for space and food", ["Share one tiny puddle forever happily only always", "Never need space", "Live only in teacups", "Fit only in jars", "Hide only in wallets", "Sleep only in shoes"]],
      ["American alligators are native to the SE USA.", "Southeastern United States including Florida", ["Only Antarctica", "Only the Moon", "Only Europe's Alps", "Only the Sahara always", "Only deep space", "Only underwater volcanoes on Mars"]],
      ["Traps and harassment harm wildlife.", "Avoid harming or trapping wildlife", ["Trap everything for sport", "Chase nests for fun", "Block dens forever", "Drain wetlands for no reason always", "Remove all plants always", "Scare mothers from nests for laughs"]],
      ["Strong jaws develop with growth.", "Jaws get stronger with age/size", ["Jaws become spaghetti", "Jaws turn into feathers", "Jaws become balloons", "Jaws become paper", "Jaws become cotton", "Jaws become jelly"]],
      ["Night activity can increase in heat.", "May be more active when cooler", ["Only dance at noon forever", "Only sleep underwater forever without air", "Never move again", "Only climb radio towers", "Only sit on chimneys", "Only ride bicycles"]],
    ],
    adult: [
      ["Adults bellow to communicate and attract mates.", "Communicate and attract mates", ["Order pizza delivery", "Start rock bands only", "Call taxis only", "Request karaoke only", "Summon fireworks only", "Ask for ice cream trucks only"]],
      ["Head-slapping is a display signal.", "A display during courtship/communication", ["A sign they dislike water always", "Proof they cannot swim", "A way to fly", "A way to become fish forever", "A weather report only", "A traffic signal for cars"]],
      ["Females build and guard nests.", "The mother/female", ["Mailbox carriers only", "Street performers only", "Parking attendants only", "Umpires only", "Referees only", "Cashiers only"]],
      ["Large males defend territory.", "Defend territory from rivals", ["Give away all land always", "Invite every rival to take over always", "Abandon water forever", "Move to deserts only", "Live only on sidewalks", "Nest only on rooftops always"]],
      ["Adults can take larger prey.", "Larger prey than hatchlings eat", ["Only crumbs forever", "Only breadcrumbs always", "Only sugar grains", "Only salt crystals", "Only pepper flakes", "Only flour dust"]],
      ["Bellowing can make water vibrate.", "Water may ripple from the sound", ["The sky turns green always instantly", "Trees become glass", "Sand becomes snow instantly always", "Rocks become pillows", "Mud becomes concrete instantly always", "Reeds become steel"]],
      ["Territory helps access mates and food.", "Space for food, mates, and safety", ["Only collecting bottle caps", "Only counting clouds", "Only naming stars", "Only sorting buttons", "Only stacking cups", "Only lining up spoons"]],
      ["Nesting season is warm months in Florida.", "Warmer months", ["Only during blizzards", "Only during ice storms", "Only in deep winter forever north", "Only during hail always", "Only during polar nights", "Only during aurora season far north"]],
      ["Respect distance from wild alligators.", "Keep a safe distance", ["Feed them sandwiches", "Pet them like dogs", "Swim at nests", "Corner them for selfies", "Block their escape paths", "Chase them inland"]],
      ["Alligators are important wetland predators.", "Help balance wetland ecosystems", ["Only decorate postcards", "Only appear in cartoons with no role", "Only live in zoos forever with no wild role", "Only exist as toys", "Only matter as stickers", "Only matter as keychains"]],
    ],
    florida: [
      ["Florida has many freshwater wetlands.", "Freshwater wetlands and marshes", ["Only glaciers", "Only tundra", "Only alpine peaks covered in ice year-round always", "Only lava fields always", "Only coral deserts of salt only", "Only frozen fjords"]],
      ["Cypress and sawgrass appear in some Florida habitats.", "Plants like cypress and sawgrass", ["Cactus forests of the Rockies only", "Pineapples growing on icebergs", "Maple syrup rivers", "Bamboo only in Antarctica", "Redwoods only underwater always", "Kelp only in deserts"]],
      ["Hot summers shape alligator behavior.", "Heat influences when they are active", ["Snowstorms every week always", "Constant ice skating weather", "Year-round blizzard warnings", "Permanent frost on palms always", "Daily hail the size of cars", "Weekly ice ages"]],
      ["Storms can raise water levels quickly.", "Water can rise in storms", ["Storms remove all gravity", "Storms turn water into cotton", "Storms freeze oceans instantly always in Florida summer", "Storms erase the sun forever", "Storms turn lakes into mountains instantly", "Storms invent new planets nearby"]],
      ["Wildlife crossings and caution protect animals and people.", "Careful driving and distance help", ["Speeding through wetlands is best always", "Feeding roadside wildlife is required", "Stopping on nests is fine", "Chasing animals from cars is safe", "Blocking waterways is helpful always", "Removing warning signs helps wildlife"]],
      ["Lakes, ponds, and canals can hold gators in Florida.", "Freshwater bodies in Florida", ["Only empty bathtubs on the moon", "Only fishbowls in space", "Only cups of tea", "Only spoons of water", "Only ice cubes in freezers far north always", "Only bottled water warehouses with no wild life"]],
      ["Pasture edges and ranch ponds may be used by wildlife.", "Edges of pastures and ponds", ["Only subway platforms", "Only airport runways as nests always", "Only stadium seats", "Only classroom desks", "Only office cubicles", "Only elevator shafts"]],
      ["Green plants make great cover.", "Vegetation for cover", ["Mirrors everywhere", "Spotlights always on", "Neon signs in dens", "Glass floors only", "Chrome walls only", "Laser fences only"]],
      ["Quiet observation is better than disturbance.", "Watch quietly from a distance", ["Throw snacks always", "Yell at nests", "Play loud music at dens", "Shine bright lights into eyes for fun", "Block exits", "Clap to make them run toward people"]],
      ["Learning facts helps people coexist safely.", "Education supports safe coexistence", ["Ignoring all safety is best", "Myths are better than facts always", "Fear without learning is the only way", "Never learning is safest", "Rumors replace science always", "Guessing is better than studying"]],
    ],
  };

  const OPENERS = [
    "True gator fact:",
    "Florida wildlife quiz:",
    "Quick swamp smarts:",
    "Alligator adventure Q:",
    "Wetland wisdom:",
    "Real-life gator knowledge:",
    "Nature check:",
    "Gator Life question:",
    "Learn as you play:",
    "Field guide pop-up:",
  ];

  const ASK = [
    "Which answer is best?",
    "What is correct?",
    "Pick the right idea:",
    "What fits real life?",
    "Choose the true one:",
    "What do scientists/wildlife guides teach?",
    "What should you remember?",
    "Which choice matches American alligators?",
  ];

  const STAGES = ["nest", "hatchling", "juvenile", "subadult", "adult", "florida"];

  function stageForLevel(levelIndex) {
    // 50 levels: 0-9 nest-ish, 10-19 hatchling, 20-29 juvenile, 30-39 subadult, 40-49 adult
    if (levelIndex < 10) return "nest";
    if (levelIndex < 20) return "hatchling";
    if (levelIndex < 30) return "juvenile";
    if (levelIndex < 40) return "subadult";
    return "adult";
  }

  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildBank() {
    const bank = [];
    let id = 0;
    // Generate many unique items per level (50+ each) and global pool
    for (let level = 0; level < 50; level++) {
      const primary = stageForLevel(level);
      const pools = [primary, "florida", STAGES[(level + 2) % STAGES.length]];
      const rand = mulberry32(1000 + level * 97);
      const levelQs = [];
      let guard = 0;
      while (levelQs.length < 55 && guard < 5000) {
        guard++;
        const poolName = pools[Math.floor(rand() * pools.length)];
        const facts = TOPICS[poolName];
        const fact = facts[Math.floor(rand() * facts.length)];
        const statement = fact[0];
        const correct = fact[1];
        const wrongs = shuffle(fact[2], rand).slice(0, 3);
        const opener = OPENERS[Math.floor(rand() * OPENERS.length)];
        const ask = ASK[Math.floor(rand() * ASK.length)];
        // Multiple phrasings for uniqueness
        const styles = [
          opener + " " + ask + " " + statement.replace(/\.$/, "") + "?",
          ask + " " + statement,
          statement.replace(/\.$/, "") + " - " + ask,
          "Level " + (level + 1) + " tip: " + ask + " " + statement.replace(/\.$/, "") + "?",
          opener + " " + statement.replace(/\.$/, "") + ". So, " + ask.toLowerCase(),
        ];
        const q = styles[Math.floor(rand() * styles.length)];
        const choices = shuffle([correct].concat(wrongs), rand);
        const correctIndex = choices.indexOf(correct);
        const explain = statement + " Great job learning!";
        const key = q + "||" + choices.join("|");
        if (levelQs.some(function (x) { return x.key === key; })) continue;
        const item = {
          id: id++,
          level: level,
          q: q,
          choices: choices,
          correct: correctIndex,
          explain: explain,
          key: key,
        };
        levelQs.push(item);
        bank.push(item);
      }
    }
    // Extra global uniqueness filler to exceed 2500
    let extra = 0;
    const rand2 = mulberry32(424242);
    while (bank.length < 2600 && extra < 10000) {
      extra++;
      const level = Math.floor(rand2() * 50);
      const poolName = STAGES[Math.floor(rand2() * STAGES.length)];
      const facts = TOPICS[poolName];
      const fact = facts[Math.floor(rand2() * facts.length)];
      const wrongs = shuffle(fact[2], rand2).slice(0, 3);
      const correct = fact[1];
      const n = bank.length;
      const q =
        OPENERS[n % OPENERS.length] +
        " (#" +
        (n + 1) +
        ") " +
        ASK[n % ASK.length] +
        " " +
        fact[0].replace(/\.$/, "") +
        "?";
      const choices = shuffle([correct].concat(wrongs), rand2);
      bank.push({
        id: id++,
        level: level,
        q: q,
        choices: choices,
        correct: choices.indexOf(correct),
        explain: fact[0] + " Keep exploring Florida nature!",
        key: q,
      });
    }
    return bank;
  }

  const BANK = buildBank();

  function questionsForLevel(levelIndex) {
    return BANK.filter(function (q) {
      return q.level === levelIndex;
    });
  }

  function pickQuestion(levelIndex, usedKeys, playSeed) {
    const pool = questionsForLevel(levelIndex);
    const rand = mulberry32((playSeed || 1) * 999 + levelIndex * 13 + (usedKeys.length + 1) * 17);
    const available = pool.filter(function (q) {
      return usedKeys.indexOf(q.key) === -1;
    });
    const list = available.length ? available : pool;
    return list[Math.floor(rand() * list.length)];
  }

  global.GATOR_QUESTIONS = {
    BANK: BANK,
    count: BANK.length,
    questionsForLevel: questionsForLevel,
    pickQuestion: pickQuestion,
    stageForLevel: stageForLevel,
  };
})(typeof window !== "undefined" ? window : globalThis);
