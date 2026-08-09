/**
 * Gator Life - large educational question bank (2500+)
 * Questions never include the correct answer in the prompt.
 * The full fact appears only after the player answers (explain).
 */
(function (global) {
  "use strict";

  // [question, correctAnswer, wrongAnswers[], factAfterAnswer]
  const TOPICS = {
    nest: [
      [
        "What helps decide if baby alligators are boys or girls?",
        "Nest temperature",
        ["The moon phase", "How loud Mom is", "Egg color", "Rain amount", "Father size", "Number of leaves"],
        "Nest temperature helps decide if babies are boys or girls.",
      ],
      [
        "Who often guards an alligator nest?",
        "The mother alligator",
        ["Only raccoons", "Tourists", "Fish", "Nobody ever", "Clouds", "Deer"],
        "Mother alligators often guard the nest.",
      ],
      [
        "Which animal is a common danger to alligator eggs?",
        "Raccoons",
        ["Butterflies", "Ladybugs", "Palm trees", "Seagull songs", "Moss", "Sand"],
        "Raccoons can raid alligator nests for eggs.",
      ],
      [
        "What are alligator nests mainly built from?",
        "Plants and mud (vegetation)",
        ["Only plastic", "Only metal", "Snow", "Glass bottles", "Concrete only", "Cloud fluff"],
        "Alligator nests are built from plants and mud.",
      ],
      [
        "Which weather problem can harm alligator eggs?",
        "Flooding",
        ["Soft breezes", "Quiet nights", "Moonlight", "Gentle dew", "Starlight", "Rainbows"],
        "Flooding can harm alligator eggs.",
      ],
      [
        "Besides flooding, what else can stress eggs in a nest?",
        "Too much heat",
        ["Soft music", "Green leaves only", "Slow clouds", "Quiet frogs", "Shade forever", "Cool mist only"],
        "Too much heat can stress eggs in a nest.",
      ],
      [
        "Where do American alligators often nest in this region?",
        "Florida wetlands and marshes",
        ["Only mountaintops", "Only open ocean", "Arctic ice", "Deserts only", "City rooftops only", "Caves of ice"],
        "American alligators nest in Florida wetlands.",
      ],
      [
        "About how long do alligator eggs usually incubate?",
        "About two months (roughly)",
        ["Two hours", "Two days only", "Twenty years", "Two minutes", "Forever", "One second"],
        "Eggs incubate for about two months, roughly.",
      ],
      [
        "Who may help hatchlings leave the nest?",
        "The mother",
        ["A bus driver", "A kite", "A bicycle", "A mailbox", "A streetlamp", "A stop sign"],
        "Mom may help hatchlings from the nest.",
      ],
      [
        "How many eggs can a nest hold?",
        "Many eggs",
        ["Only one grain of sand", "Only feathers", "Only rocks", "Only keys", "Only coins", "Only buttons"],
        "Nests can hold many eggs at once.",
      ],
    ],
    hatchling: [
      [
        "Why do baby alligators have yellow stripes?",
        "Camouflage in grass and plants",
        ["Faster Wi-Fi", "Louder music", "Brighter neon signs", "Better backpacks", "Flying", "Ice skating"],
        "Baby alligators have yellow stripes for camouflage.",
      ],
      [
        "What is a smart habit for tiny hatchlings?",
        "Stay near Mom and hide",
        ["Drive cars", "Build skyscrapers", "Fly airplanes", "Cook pizza alone", "Mine diamonds", "Surf volcanoes"],
        "Hatchlings are tiny and need Mom's protection.",
      ],
      [
        "About how long may moms protect hatchlings?",
        "About 1-2 years",
        ["Two seconds", "Forever without change", "Exactly 100 years only", "One blink", "Zero days always", "A thousand moons only"],
        "Moms may protect young about 1-2 years.",
      ],
      [
        "What might hunt a tiny hatchling?",
        "Big birds (and other predators)",
        ["Paper airplanes only", "Cotton balls", "Soap bubbles", "Feathers alone with no bird", "Cloud shapes", "Shadows of leaves only"],
        "Birds and other predators can hunt tiny hatchlings.",
      ],
      [
        "What kind of sound do hatchlings often make?",
        "High peeps or yelps",
        ["Truck horns only", "Opera forever", "Silence always", "Drum kits", "Church bells only", "Train whistles only"],
        "Hatchlings call with high peeps.",
      ],
      [
        "What happens to yellow stripes as gators grow?",
        "They fade with age",
        ["They turn into polka dots forever", "They become rainbow lasers", "They never change ever", "They become barcodes", "They turn into words", "They become glitter only"],
        "Stripes fade as gators grow older.",
      ],
      [
        "How can water plants help hatchlings?",
        "Hiding among plants",
        ["Learning algebra only", "Watching TV", "Buying shoes", "Painting fences", "Flying kites only", "Baking cakes"],
        "Water plants help hatchlings hide.",
      ],
      [
        "Which of these can be a danger to hatchlings?",
        "Snakes (and other predators)",
        ["Marshmallows", "Pillows", "Blankets", "Socks", "Buttons", "Erasers"],
        "Snakes can be a danger to hatchlings.",
      ],
      [
        "What skills do hatchlings learn early?",
        "Swim and hide",
        ["Pilot jets", "Drive submarines for fun only", "Race motorcycles", "Skateboard on clouds", "Climb skyscrapers alone", "Juggle cars"],
        "Hatchlings learn to swim early.",
      ],
      [
        "What can help hatchling survival?",
        "Staying near family/group",
        ["Leaving Earth", "Hiding in outer space", "Becoming invisible forever magically", "Turning into frogs permanently", "Ignoring water forever", "Avoiding all shade forever"],
        "Staying in a group can help survival.",
      ],
    ],
    juvenile: [
      [
        "What might a young juvenile alligator eat?",
        "Insects, frogs, and small fish",
        ["Only metal cans", "Only coconuts always", "Only notebooks", "Only sneakers", "Only traffic cones", "Only umbrellas"],
        "Young gators eat insects, frogs, and small fish.",
      ],
      [
        "How does a gator's diet change as it grows?",
        "Larger prey over time",
        ["Only air forever", "Only sunlight calories", "Only rainwater energy", "Only music notes", "Only shadows", "Only echoes"],
        "Diet grows as the gator grows.",
      ],
      [
        "What is a gator hole useful for?",
        "Dens that hold water",
        ["Golf ball machines", "Vending machines", "Movie theaters only", "Elevators", "Escalators", "Ferris wheels"],
        "Gator holes hold water in dry seasons.",
      ],
      [
        "What should a small gator do around a huge gator?",
        "Avoid much bigger gators",
        ["Challenge every whale", "Race every truck", "Hug every boat motor", "Chase every airplane", "Tackle every train", "Wrestle every crane"],
        "Avoid bigger alligators when you are small.",
      ],
      [
        "What do wetlands provide for young gators?",
        "Food and cover",
        ["Only parking meters", "Only stop lights", "Only crosswalks", "Only billboards", "Only fire hydrants", "Only mailboxes"],
        "Wetlands provide food and cover.",
      ],
      [
        "What do juveniles often search for?",
        "Safe water and food",
        ["Only shopping malls", "Only roller coasters", "Only stadiums", "Only airports", "Only subways", "Only elevators"],
        "Juveniles search for safe water.",
      ],
      [
        "Which is common prey for a juvenile?",
        "Small fish (and more)",
        ["Satellites", "Comets", "Asteroids", "Space stations", "Meteor showers", "Black holes"],
        "Fish are common juvenile prey.",
      ],
      [
        "How should people and pets act near wild gators?",
        "Give wildlife space",
        ["Feed every wild gator by hand", "Swim toward nests always", "Chase wildlife for photos only unsafe", "Corner wild animals", "Block their water forever", "Trap them for fun"],
        "Humans and pets should keep a safe distance.",
      ],
      [
        "Why are water holes extra important in dry season?",
        "Water becomes limited",
        ["Oceans disappear forever instantly always", "Rain never existed", "Florida turns to ice permanently overnight always", "All lakes become chocolate", "Rivers become highways only", "Clouds become solid roads"],
        "Dry seasons make water holes precious.",
      ],
      [
        "How does camouflage help young gators?",
        "Blending into habitat",
        ["Wearing clown shoes", "Using neon paint always", "Carrying flashlights on their heads always", "Wearing traffic vests forever", "Using disco lights", "Waving flags constantly"],
        "Camouflage still helps young gators.",
      ],
    ],
    subadult: [
      [
        "Why might a sub-adult travel over land?",
        "Find new territory or water",
        ["Attend college lectures only", "Buy concert tickets only", "Collect stamps only", "Watch only cartoons forever", "Play only video games forever", "Ignore all water forever"],
        "Sub-adults may travel to find territory.",
      ],
      [
        "What should gators try to avoid near people?",
        "Avoid close boat traffic",
        ["Hug propellers", "Race engines underwater always", "Sleep on boat motors", "Chase every ski rope", "Bite every paddleboard always", "Block every channel on purpose"],
        "Boats can be dangerous nearby.",
      ],
      [
        "What do people call dens gators dig for water?",
        "Gator holes (dens)",
        ["Rocket silos", "Subway tunnels only in cities", "Ski lodges", "Igloos only", "Treehouses only in oaks always", "Sandcastles only on beaches always"],
        "Gators dig dens called gator holes.",
      ],
      [
        "Who else can benefit from gator holes?",
        "Other wildlife can benefit",
        ["Only robots", "Only drones", "Only satellites", "Only helicopters", "Only airplanes", "Only blimps"],
        "Other animals use gator holes too.",
      ],
      [
        "Why can crossing dry land be risky?",
        "Travel carefully for water/territory",
        ["Fly without wings", "Teleport always", "Become invisible legally", "Turn into mist forever", "Walk on clouds safely always", "Surf on sunshine beams"],
        "Crossing dry land can be risky, so travel carefully.",
      ],
      [
        "As gators grow, what often increases?",
        "Compete for space and food",
        ["Share one tiny puddle forever happily only always", "Never need space", "Live only in teacups", "Fit only in jars", "Hide only in wallets", "Sleep only in shoes"],
        "Competition rises with size.",
      ],
      [
        "Where are American alligators native?",
        "Southeastern United States including Florida",
        ["Only Antarctica", "Only the Moon", "Only Europe's Alps", "Only the Sahara always", "Only deep space", "Only underwater volcanoes on Mars"],
        "American alligators are native to the southeastern USA.",
      ],
      [
        "What is the right idea about traps and wildlife?",
        "Avoid harming or trapping wildlife",
        ["Trap everything for sport", "Chase nests for fun", "Block dens forever", "Drain wetlands for no reason always", "Remove all plants always", "Scare mothers from nests for laughs"],
        "Traps and harassment harm wildlife.",
      ],
      [
        "What happens to jaws as a gator grows?",
        "Jaws get stronger with age/size",
        ["Jaws become spaghetti", "Jaws turn into feathers", "Jaws become balloons", "Jaws become paper", "Jaws become cotton", "Jaws become jelly"],
        "Strong jaws develop with growth.",
      ],
      [
        "In hot weather, when might gators be more active?",
        "May be more active when cooler",
        ["Only dance at noon forever", "Only sleep underwater forever without air", "Never move again", "Only climb radio towers", "Only sit on chimneys", "Only ride bicycles"],
        "Night or cooler times can mean more activity in heat.",
      ],
    ],
    adult: [
      [
        "Why do adult alligators bellow?",
        "Communicate and attract mates",
        ["Order pizza delivery", "Start rock bands only", "Call taxis only", "Request karaoke only", "Summon fireworks only", "Ask for ice cream trucks only"],
        "Adults bellow to communicate and attract mates.",
      ],
      [
        "What can head-slapping the water mean?",
        "A display during courtship/communication",
        ["A sign they dislike water always", "Proof they cannot swim", "A way to fly", "A way to become fish forever", "A weather report only", "A traffic signal for cars"],
        "Head-slapping is a display signal.",
      ],
      [
        "Who usually builds and guards the nest?",
        "The mother/female",
        ["Mailbox carriers only", "Street performers only", "Parking attendants only", "Umpires only", "Referees only", "Cashiers only"],
        "Females build and guard nests.",
      ],
      [
        "What may large males do about territory?",
        "Defend territory from rivals",
        ["Give away all land always", "Invite every rival to take over always", "Abandon water forever", "Move to deserts only", "Live only on sidewalks", "Nest only on rooftops always"],
        "Large males defend territory.",
      ],
      [
        "How does adult prey compare to hatchling prey?",
        "Larger prey than hatchlings eat",
        ["Only crumbs forever", "Only breadcrumbs always", "Only sugar grains", "Only salt crystals", "Only pepper flakes", "Only flour dust"],
        "Adults can take larger prey.",
      ],
      [
        "What can a loud bellow do to nearby water?",
        "Water may ripple from the sound",
        ["The sky turns green always instantly", "Trees become glass", "Sand becomes snow instantly always", "Rocks become pillows", "Mud becomes concrete instantly always", "Reeds become steel"],
        "Bellowing can make water vibrate or ripple.",
      ],
      [
        "Why is territory useful for adults?",
        "Space for food, mates, and safety",
        ["Only collecting bottle caps", "Only counting clouds", "Only naming stars", "Only sorting buttons", "Only stacking cups", "Only lining up spoons"],
        "Territory helps access mates and food.",
      ],
      [
        "When is nesting season in Florida, generally?",
        "Warmer months",
        ["Only during blizzards", "Only during ice storms", "Only in deep winter forever north", "Only during hail always", "Only during polar nights", "Only during aurora season far north"],
        "Nesting season is in warmer months in Florida.",
      ],
      [
        "What should people do around wild alligators?",
        "Keep a safe distance",
        ["Feed them sandwiches", "Pet them like dogs", "Swim at nests", "Corner them for selfies", "Block their escape paths", "Chase them inland"],
        "Respect distance from wild alligators.",
      ],
      [
        "Why are alligators important in wetlands?",
        "Help balance wetland ecosystems",
        ["Only decorate postcards", "Only appear in cartoons with no role", "Only live in zoos forever with no wild role", "Only exist as toys", "Only matter as stickers", "Only matter as keychains"],
        "Alligators are important wetland predators.",
      ],
    ],
    florida: [
      [
        "What kind of habitat is common for Florida gators?",
        "Freshwater wetlands and marshes",
        ["Only glaciers", "Only tundra", "Only alpine peaks covered in ice year-round always", "Only lava fields always", "Only coral deserts of salt only", "Only frozen fjords"],
        "Florida has many freshwater wetlands.",
      ],
      [
        "Which plants can appear in some Florida gator habitats?",
        "Plants like cypress and sawgrass",
        ["Cactus forests of the Rockies only", "Pineapples growing on icebergs", "Maple syrup rivers", "Bamboo only in Antarctica", "Redwoods only underwater always", "Kelp only in deserts"],
        "Cypress and sawgrass appear in some Florida habitats.",
      ],
      [
        "How can hot summers affect alligators?",
        "Heat influences when they are active",
        ["Snowstorms every week always", "Constant ice skating weather", "Year-round blizzard warnings", "Permanent frost on palms always", "Daily hail the size of cars", "Weekly ice ages"],
        "Hot summers shape alligator behavior.",
      ],
      [
        "What can storms do to water levels?",
        "Water can rise in storms",
        ["Storms remove all gravity", "Storms turn water into cotton", "Storms freeze oceans instantly always in Florida summer", "Storms erase the sun forever", "Storms turn lakes into mountains instantly", "Storms invent new planets nearby"],
        "Storms can raise water levels quickly.",
      ],
      [
        "What helps people and animals stay safer near wildlife?",
        "Careful driving and distance help",
        ["Speeding through wetlands is best always", "Feeding roadside wildlife is required", "Stopping on nests is fine", "Chasing animals from cars is safe", "Blocking waterways is helpful always", "Removing warning signs helps wildlife"],
        "Wildlife crossings and caution protect animals and people.",
      ],
      [
        "Where in Florida might you find alligators?",
        "Freshwater bodies in Florida",
        ["Only empty bathtubs on the moon", "Only fishbowls in space", "Only cups of tea", "Only spoons of water", "Only ice cubes in freezers far north always", "Only bottled water warehouses with no wild life"],
        "Lakes, ponds, and canals can hold gators in Florida.",
      ],
      [
        "Which landscape edges may wildlife use?",
        "Edges of pastures and ponds",
        ["Only subway platforms", "Only airport runways as nests always", "Only stadium seats", "Only classroom desks", "Only office cubicles", "Only elevator shafts"],
        "Pasture edges and ranch ponds may be used by wildlife.",
      ],
      [
        "What makes great cover for a gator?",
        "Vegetation for cover",
        ["Mirrors everywhere", "Spotlights always on", "Neon signs in dens", "Glass floors only", "Chrome walls only", "Laser fences only"],
        "Green plants make great cover.",
      ],
      [
        "What is a good way to watch wildlife?",
        "Watch quietly from a distance",
        ["Throw snacks always", "Yell at nests", "Play loud music at dens", "Shine bright lights into eyes for fun", "Block exits", "Clap to make them run toward people"],
        "Quiet observation is better than disturbance.",
      ],
      [
        "Why learn real alligator facts?",
        "Education supports safe coexistence",
        ["Ignoring all safety is best", "Myths are better than facts always", "Fear without learning is the only way", "Never learning is safest", "Rumors replace science always", "Guessing is better than studying"],
        "Learning facts helps people coexist safely.",
      ],
    ],
  };

  const OPENERS = [
    "Florida wildlife quiz:",
    "Quick swamp smarts:",
    "Alligator adventure:",
    "Wetland wisdom:",
    "Nature check:",
    "Gator Life quiz:",
    "Field guide pop-up:",
    "Think like a biologist:",
    "True or tricky:",
    "Swamp school:",
  ];

  const STAGES = ["nest", "hatchling", "juvenile", "subadult", "adult", "florida"];

  function stageForLevel(levelIndex) {
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

    for (let level = 0; level < 50; level++) {
      const primary = stageForLevel(level);
      const pools = [primary, "florida", STAGES[(level + 2) % STAGES.length]];
      const rand = mulberry32(1000 + level * 97);
      const levelQs = [];
      let guard = 0;

      while (levelQs.length < 55 && guard < 8000) {
        guard++;
        const poolName = pools[Math.floor(rand() * pools.length)];
        const facts = TOPICS[poolName];
        const fact = facts[Math.floor(rand() * facts.length)];
        const questionBase = fact[0];
        const correct = fact[1];
        const wrongs = shuffle(fact[2], rand).slice(0, 3);
        const explain = fact[3];
        const opener = OPENERS[Math.floor(rand() * OPENERS.length)];

        // Phrasings that NEVER include the correct answer text
        const styles = [
          opener + " " + questionBase,
          "Level " + (level + 1) + ": " + questionBase,
          questionBase,
          opener + " " + questionBase.replace(/\?$/, "") + "?",
          "Pop quiz! " + questionBase,
        ];
        const q = styles[Math.floor(rand() * styles.length)];
        const choices = shuffle([correct].concat(wrongs), rand);
        const correctIndex = choices.indexOf(correct);
        const key = q + "||" + choices.join("|");

        // Safety: reject if question text contains the correct answer (case-insensitive)
        if (q.toLowerCase().indexOf(String(correct).toLowerCase()) !== -1) continue;
        // Also reject if a long chunk of the answer appears
        const correctWords = String(correct).toLowerCase().split(/\s+/).filter(function (w) {
          return w.length > 4;
        });
        var leak = false;
        for (var wi = 0; wi < correctWords.length; wi++) {
          if (q.toLowerCase().indexOf(correctWords[wi]) !== -1 && correctWords[wi].length > 6) {
            leak = true;
            break;
          }
        }
        if (leak) continue;

        if (levelQs.some(function (x) {
          return x.key === key;
        }))
          continue;

        const item = {
          id: id++,
          level: level,
          q: q,
          choices: choices,
          correct: correctIndex,
          explain: explain + " Great job learning!",
          key: key,
        };
        levelQs.push(item);
        bank.push(item);
      }
    }

    // Filler to keep total high (still no answer leak)
    let extra = 0;
    const rand2 = mulberry32(424242);
    while (bank.length < 2600 && extra < 15000) {
      extra++;
      const level = Math.floor(rand2() * 50);
      const poolName = STAGES[Math.floor(rand2() * STAGES.length)];
      const facts = TOPICS[poolName];
      const fact = facts[Math.floor(rand2() * facts.length)];
      const wrongs = shuffle(fact[2], rand2).slice(0, 3);
      const correct = fact[1];
      const n = bank.length;
      const q = OPENERS[n % OPENERS.length] + " " + fact[0];
      if (q.toLowerCase().indexOf(String(correct).toLowerCase()) !== -1) continue;
      const choices = shuffle([correct].concat(wrongs), rand2);
      bank.push({
        id: id++,
        level: level,
        q: q,
        choices: choices,
        correct: choices.indexOf(correct),
        explain: fact[3] + " Keep exploring Florida nature!",
        key: q + "||" + choices.join("|") + "||" + n,
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
