/**
 * Gator Life quiz bank
 * - Question text never includes the correct answer
 * - Exactly one clearly correct choice
 * - Other choices are loosely related (plausible mistakes), not silly nonsense
 * - 50 levels x large pools; explain text only after answering
 */
(function (global) {
  "use strict";

  // [question, correct, wrong1, wrong2, wrong3, explainAfter]
  // Keep wrong answers related to nature/wildlife/habitat so they feel fair.
  const CORE = [
    // Nest / eggs
    ["What mainly helps decide whether baby alligators become male or female?", "How warm or cool the nest is", "How many eggs are in the nest", "How loud the parents call", "How deep the water is nearby", "Nest temperature helps decide if hatchlings are male or female."],
    ["Who usually stays near and protects an alligator nest?", "The mother alligator", "The father alligator only", "A group of raccoons", "A flock of wading birds", "Mother alligators often guard the nest."],
    ["Which animal is a real nest-raiding risk for alligator eggs?", "Raccoons", "Manatees", "Dragonflies", "Tree frogs", "Raccoons and some other animals may raid nests for eggs."],
    ["What materials do alligators usually use to build a nest?", "Plants, mud, and vegetation", "Loose stones and gravel only", "Dry sand dunes only", "Fallen tree bark only", "Nests are built mainly from plants, mud, and vegetation."],
    ["Which condition can seriously harm eggs in a nest?", "Flooding that covers the nest", "A light morning mist", "A quiet night with no wind", "Soft moonlight", "Flooding can harm eggs if water covers the nest."],
    ["Besides flooding, what can stress alligator eggs?", "Nest getting too hot", "Gentle shade from plants", "Cool night air", "A light breeze", "Too much heat can stress eggs in the nest."],
    ["Where in Florida do American alligators often nest?", "Wetlands and marsh edges", "Open ocean beaches only", "High rocky cliffs only", "Dry desert scrub only", "They often nest in wetlands and marsh areas."],
    ["About how long do alligator eggs usually incubate before hatching?", "Around two months", "Around two days", "Around two weeks only", "Around two years", "Incubation is often about two months."],
    ["Who may carefully help young out of the nest area?", "The mother", "Nearby fish", "Passing turtles only", "Insects in the grass", "Mothers may help hatchlings from the nest area."],
    ["How many eggs can one nest typically hold?", "A large clutch of many eggs", "Always exactly one egg", "Always exactly two eggs", "Eggs are never laid in nests", "A nest can hold many eggs at once."],

    // Hatchlings
    ["Why do hatchling alligators have bright yellow stripes?", "To blend into grass and plants", "To attract fish for food right away", "To signal boats that they are near", "To help them run faster on land", "Yellow stripes help camouflage hatchlings among plants."],
    ["What is the safest place for a new hatchling to stay?", "Close to its mother", "Far from any water", "In open sunny sand alone", "High in tree branches", "Hatchlings stay safer near Mom."],
    ["About how long may a mother watch over her young?", "About one to two years", "Only a few hours", "Only until sunset that day", "For their whole adult life side by side", "Protection often lasts about one to two years."],
    ["Which is a real danger to tiny hatchlings?", "Large wading birds", "Floating lily pads", "Soft mud banks", "Calm shallow water", "Large birds and other predators can hunt hatchlings."],
    ["What kind of call do hatchlings often make?", "High peeps or yelps", "Deep adult bellows", "Silent mouth bubbles only", "Loud boat-like horns", "Hatchlings often peep or yelp."],
    ["What happens to the bright yellow stripes as a gator grows?", "They usually fade with age", "They get brighter each year", "They turn into permanent black spots only", "They change into blue bands", "Stripes usually fade as the animal grows."],
    ["How can thick water plants help a hatchling?", "By giving places to hide", "By cooling the entire swamp instantly", "By feeding only adult gators", "By blocking all sunlight forever", "Plants offer cover for small gators."],
    ["Besides birds, what else can threaten hatchlings?", "Snakes and other predators", "Dragonfly shadows only", "Fallen cypress leaves", "Gentle raindrops", "Snakes and other predators can threaten hatchlings."],
    ["What do hatchlings learn to do early in life?", "Swim and hide", "Build their own large nests", "Bellow as loud as adults", "Dig deep winter dens alone far away", "They learn to swim and hide early."],
    ["Why can staying near siblings help hatchlings?", "There is safety in a family group", "It makes the water warmer forever", "It stops all predators instantly", "It teaches them to fly", "Staying near family can improve survival odds."],

    // Juveniles
    ["What foods fit a young juvenile alligator best?", "Insects, frogs, and small fish", "Only large deer", "Only ripe fruit from trees", "Only grass and leaves", "Young gators often eat insects, frogs, and small fish."],
    ["As an alligator grows, what usually happens to its diet?", "It can take larger prey", "It stops eating completely", "It eats only flowers", "It drinks only rainwater", "Larger gators can handle larger prey."],
    ["What is a 'gator hole' mainly good for?", "Holding water during dry times", "Attracting boats for fun", "Storing rocks for later", "Marking hiking trails", "Gator holes hold water in dry seasons."],
    ["What should a small gator do around a much bigger alligator?", "Keep away if possible", "Challenge it right away", "Follow it onto dry roads", "Steal food from its mouth", "Small gators are safer avoiding larger ones."],
    ["What do wetlands mainly provide young gators?", "Food and places to hide", "Parking for cars", "Wind for flying", "Ice for cooling only", "Wetlands offer food and cover."],
    ["What do young gators often look for as seasons change?", "Safe water and food", "Mountain caves only", "Open ocean waves only", "City fountains only", "They search for safe water and food."],
    ["Which prey is common for a still-growing gator?", "Small fish", "Full-grown cattle only", "Coconuts only", "Pine cones only", "Small fish are common prey for juveniles."],
    ["What is the safest human choice near wild alligators?", "Give them plenty of space", "Offer them snacks by hand", "Swim next to nesting sites", "Corner them for a photo", "People should keep a safe distance and never feed wild gators."],
    ["Why do water holes matter more in a dry season?", "Open water can become scarce", "All fish leave Florida forever", "Plants stop needing sunlight", "Air becomes too cold to breathe", "Dry seasons make remaining water extra important."],
    ["How does blending into habitat help a young gator?", "It is harder for predators to spot", "It makes bellowing louder", "It grows stripes overnight", "It cools the whole marsh", "Camouflage makes young gators harder to see."],

    // Sub-adult
    ["Why might a growing alligator travel across dry ground?", "To reach new water or territory", "To attend school each morning", "To find sidewalk chalk", "To avoid all plants forever", "They may move seeking water or territory."],
    ["What human-related danger can appear in waterways?", "Boats moving too close", "Quiet kayaks far away only", "Park benches on shore", "Bird feeders in yards", "Boats can be dangerous if wildlife and people get too close."],
    ["What do alligators dig that can hold water?", "Dens often called gator holes", "Sandcastles on the beach", "Tunnels under highways only", "Nests made only of stones", "They dig dens (gator holes) that hold water."],
    ["Who else may use a water-filled gator hole?", "Other wetland animals", "Only airplane pilots", "Only subway trains", "Only shopping carts", "Other wildlife can benefit from gator holes."],
    ["What is a smart approach when moving through dry areas?", "Travel carefully toward safe water", "Run toward every loud noise", "Rest in the middle of roads", "Follow boat propellers closely", "Careful travel helps them reach safer water."],
    ["As alligators get larger, what often increases?", "Competition for space and food", "Their need for snowy mountains", "Their ability to live only in deserts", "Their preference for deep ocean only", "Bigger gators may compete more for space and food."],
    ["Where are American alligators native?", "The southeastern United States, including Florida", "Only Antarctica", "Only Europe’s high Alps", "Only the open Pacific Ocean", "They are native to the southeastern U.S., including Florida."],
    ["What is the right idea about trapping or harassing wildlife?", "It harms animals and is unsafe", "It always helps nests succeed", "It makes wetlands healthier every time", "It is required to study birds", "Trapping or harassing wildlife is harmful and unsafe."],
    ["What happens to jaw strength as a gator matures?", "Jaws generally get stronger", "Jaws become soft like cloth", "Jaws stop working after year one", "Jaws only work in salt water", "Jaws typically get stronger with growth."],
    ["In very hot weather, when might activity increase?", "During cooler parts of day or night", "Only at the hottest noon hour always", "Only during freezes", "Only during blizzards", "They may be more active when it is cooler."],

    // Adult
    ["Why do adult alligators bellow?", "To communicate and attract mates", "To call delivery drivers", "To start thunderstorms", "To turn off the sun", "Bellowing is used to communicate and attract mates."],
    ["What can head-slapping on the water signal?", "A display used in communication", "That they cannot swim", "That they want to leave water forever", "That a storm has already ended", "Head-slapping can be a communication display."],
    ["Who usually builds and guards the nest?", "The female alligator", "Only neighboring deer", "Only adult male songbirds", "Only turtles from another pond", "Females typically build and guard nests."],
    ["What may large males do when other big males approach?", "Defend their territory", "Invite them to take over the whole area", "Leave water for deserts forever", "Stop eating for a year", "Large males may defend territory from rivals."],
    ["How does adult prey size compare with hatchling prey?", "Adults can take larger prey", "Adults eat only smaller insects forever", "Adults eat only tree bark", "Adults never eat fish again", "Adults can handle larger prey than hatchlings."],
    ["What can a strong bellow do to nearby water?", "Make the surface ripple or vibrate", "Turn water into dry sand instantly", "Freeze the marsh solid in summer", "Remove all oxygen from the air", "A loud bellow can ripple the water."],
    ["Why is holding territory useful for adults?", "It helps with food, mates, and space", "It guarantees endless ice", "It removes the need for water", "It stops all plants from growing", "Territory supports access to food, mates, and space."],
    ["When does nesting usually happen in Florida?", "During warmer months", "Only during heavy freezes", "Only during ice storms", "Only during polar night", "Nesting is tied to warmer months."],
    ["What should people do if they see a wild alligator?", "Keep a safe distance", "Try to feed it from your hand", "Swim toward its nest", "Chase it for a closer look", "Always keep a safe distance; never feed wild alligators."],
    ["Why do alligators matter in wetlands?", "They help balance the ecosystem as predators", "They only decorate postcards", "They only live as toys", "They only matter in cartoons", "As predators, they help keep wetland systems in balance."],

    // Florida habitat / safety
    ["What kind of Florida habitat suits American alligators best?", "Freshwater wetlands and marshes", "High frozen mountains only", "Open deep ocean only", "Dry sandy deserts only", "Freshwater wetlands and marshes are key habitat."],
    ["Which plants might you see in some Florida wetland habitats?", "Cypress and sawgrass", "Only arctic mosses", "Only alpine wildflowers", "Only cactus forests of the far west", "Cypress and sawgrass can appear in some wetland habitats."],
    ["How can summer heat affect alligator behavior?", "It can change when they are most active", "It forces them to live only underground forever", "It turns them into fish", "It stops them from ever entering water", "Heat can influence daily activity patterns."],
    ["What can heavy storms do to wetland water?", "Raise water levels quickly", "Remove gravity from water", "Turn lakes into mountains", "Erase all rivers permanently", "Storms can raise water levels fast."],
    ["What helps people and wildlife stay safer near roads and water?", "Careful driving and keeping distance", "Feeding animals from car windows", "Stopping on nests for photos", "Removing all warning signs", "Care and distance help everyone stay safer."],
    ["Which places in Florida may hold alligators?", "Lakes, ponds, marshes, and some canals", "Only empty swimming pools on other planets", "Only indoor aquariums with no doors", "Only frozen mountain lakes far north", "Freshwater bodies across Florida can hold gators."],
    ["Which landscape edges may wildlife use?", "Edges of pastures and ponds", "Only subway platforms", "Only airport runways as nests", "Only classroom desks", "Pasture edges and ponds can attract wildlife."],
    ["What provides natural cover for an alligator?", "Plants and shoreline vegetation", "Bright spotlights", "Glass walls", "Chrome fences", "Vegetation offers natural cover."],
    ["What is a good way to observe wildlife?", "Watch quietly from a safe distance", "Yell near nests to see movement", "Play loud music at dens", "Block animals so they cannot leave", "Quiet, distant watching is best."],
    ["Why learn real alligator facts?", "Facts help people live safely near wildlife", "Myths are always more accurate", "Guessing is better than learning", "Safety rules are never useful", "Good information supports safe coexistence."],

    // Extra related set for variety
    ["What is a hatchling alligator like at birth?", "Small, with yellow stripes", "Already as big as an adult", "Covered in thick fur", "Unable to enter water at all", "Hatchlings are small and striped."],
    ["What role does shallow water play for young gators?", "Hunting small prey and staying safer", "Learning to fly short distances", "Building wooden docks", "Attracting large ships", "Shallows help young gators hunt small prey."],
    ["What should you never do with wild alligators?", "Feed them", "Observe from far away", "Stay on marked paths", "Keep pets leashed near water", "Never feed wild alligators."],
    ["What can thick grass and reeds do for a young gator?", "Hide it from predators", "Teach it to climb cliffs", "Turn water salty", "Stop rain from falling", "Vegetation helps them hide."],
    ["What is one reason wetlands matter to Florida wildlife?", "They provide food, water, and shelter", "They remove the need for any plants", "They only exist in winter ice", "They are only used by ocean whales", "Wetlands provide food, water, and shelter."],
    ["What might a juvenile do when water levels drop?", "Seek remaining water holes", "Move permanently to the open ocean", "Stop drinking forever", "Climb into attics of houses for fun", "They often seek remaining water holes."],
    ["What is a sign of adult communication?", "Bellowing", "Whistling like a teapot", "Barking like a small dog only", "Silent glowing of the eyes as a light beam", "Bellowing is a form of adult communication."],
    ["What is a safer place for people near gator habitat?", "A clear distance from the water’s edge", "Standing on floating nests", "Wading at night toward glowing eyes", "Feeding areas people create", "Stay a clear distance from the water’s edge."],
    ["What do eggs need during incubation?", "A stable nest environment", "Daily trips into deep lakes", "Constant freezing temperatures", "Ocean salt spray only", "Eggs need a fairly stable nest environment."],
    ["What can happen if people get too close to a nest?", "It can stress or endanger wildlife (and people)", "It always helps the eggs hatch faster", "It makes the mother leave forever happily", "It turns eggs into hatchlings instantly", "Disturbing nests can be dangerous for animals and people."],
    ["What is camouflage?", "Blending in with surroundings", "Making the loudest sound possible", "Swimming only at night forever", "Building the tallest nest", "Camouflage means blending into surroundings."],
    ["What kind of animal is an American alligator?", "A large reptile", "A marine mammal like a dolphin", "A wading bird", "An amphibian that only lives in trees", "American alligators are large reptiles."],
    ["Where do hatchlings often stay at first?", "Near the nest area with family", "Alone on dry highways", "In deep Gulf currents only", "On rooftops of towns", "They often stay near the nest area with family."],
    ["What can other animals gain from gator-made water holes?", "Access to water in dry times", "Free boat rides", "A place to park cars", "A source of ice cream", "Other animals may use those water holes too."],
    ["What is a key safety rule for pets near water in gator country?", "Keep pets away from the water’s edge", "Let pets swim unattended at dusk", "Feed pets at the shoreline daily", "Train pets to chase wildlife", "Keep pets away from the water’s edge."],
    ["What changes as an alligator grows from hatchling to adult?", "Size, diet, and behavior", "It becomes a fish permanently", "It loses all need for water", "It grows feathers for flight", "Size, diet, and behavior change with growth."],
    ["What kind of water do American alligators prefer most often?", "Fresh water", "Only boiling hot springs", "Only deep open ocean", "Only pure salt deserts", "They most often use fresh water."],
    ["What is a nest clutch?", "A group of eggs laid together", "A group of adult males only", "A type of boat motor", "A kind of marsh flower", "A clutch is a group of eggs."],
    ["What can thick shoreline plants offer adults?", "Cover and edges for hunting or resting", "A place to store bicycles", "A runway for planes", "A substitute for water itself", "Shoreline plants offer cover and useful edges."],
    ["What should you do if you hook a fish near gators?", "Be cautious and keep distance; do not throw scraps", "Toss fish scraps to attract them closer", "Wade in to show the catch", "Stand on the nest for a better cast", "Be careful and never throw scraps to wildlife."],
  ];

  const OPENERS = [
    "",
    "Quick quiz: ",
    "Wetland check: ",
    "Gator Life: ",
    "Think carefully: ",
    "Florida nature: ",
    "Pop quiz: ",
    "Wildlife question: ",
  ];

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

  function normalize(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** True if question text spoils the correct answer */
  function questionLeaksAnswer(question, correct) {
    const q = normalize(question);
    const c = normalize(correct);
    if (!c || !q) return true;
    if (q.indexOf(c) !== -1) return true;
    // Significant words from the answer (length > 5) should not all appear
    const words = c.split(" ").filter(function (w) {
      return w.length > 5;
    });
    if (words.length === 0) return false;
    var hits = 0;
    for (var i = 0; i < words.length; i++) {
      if (q.indexOf(words[i]) !== -1) hits++;
    }
    // If most distinctive answer words appear in the question, treat as leak
    if (words.length >= 2 && hits >= Math.ceil(words.length * 0.75)) return true;
    if (words.length === 1 && hits === 1 && words[0].length > 8) return true;
    return false;
  }

  function buildBank() {
    const bank = [];
    let id = 0;

    for (let level = 0; level < 50; level++) {
      const rand = mulberry32(5000 + level * 131);
      const levelQs = [];
      let guard = 0;

      while (levelQs.length < 55 && guard < 20000) {
        guard++;
        const row = CORE[Math.floor(rand() * CORE.length)];
        const questionBase = row[0];
        const correct = row[1];
        const wrongs = [row[2], row[3], row[4]];
        const explain = row[5];
        const opener = OPENERS[Math.floor(rand() * OPENERS.length)];

        // Vary wording without revealing answer
        const styles = [
          opener + questionBase,
          "Level " + (level + 1) + " — " + questionBase,
          questionBase,
          opener + questionBase.replace(/\?$/, "") + "?",
        ];
        // Fix: user didn't want long dashes - use simple hyphen
        const styles2 = [
          opener + questionBase,
          "Level " + (level + 1) + ": " + questionBase,
          questionBase,
          opener + questionBase.replace(/\?$/, "") + "?",
        ];
        const q = styles2[Math.floor(rand() * styles2.length)];

        if (questionLeaksAnswer(q, correct)) continue;

        const choices = shuffle([correct].concat(wrongs), rand);
        // Ensure unique choice strings
        const uniq = [];
        choices.forEach(function (ch) {
          if (uniq.indexOf(ch) === -1) uniq.push(ch);
        });
        if (uniq.length < 4) continue;

        const correctIndex = uniq.indexOf(correct);
        if (correctIndex < 0) continue;

        const key = q + "||" + uniq.join("|");
        if (
          levelQs.some(function (x) {
            return x.key === key;
          })
        )
          continue;

        const item = {
          id: id++,
          level: level,
          q: q,
          choices: uniq,
          correct: correctIndex,
          explain: explain,
          key: key,
        };
        levelQs.push(item);
        bank.push(item);
      }
    }

    // Extra unique cards to keep pool large
    let extra = 0;
    const rand2 = mulberry32(99991);
    while (bank.length < 2600 && extra < 30000) {
      extra++;
      const level = Math.floor(rand2() * 50);
      const row = CORE[Math.floor(rand2() * CORE.length)];
      const correct = row[1];
      const wrongs = shuffle([row[2], row[3], row[4]], rand2);
      const opener = OPENERS[Math.floor(rand2() * OPENERS.length)];
      const q = opener + row[0];
      if (questionLeaksAnswer(q, correct)) continue;
      const choices = shuffle([correct].concat(wrongs), rand2);
      const key = q + "||" + choices.join("|") + "||" + bank.length;
      bank.push({
        id: id++,
        level: level,
        q: q,
        choices: choices,
        correct: choices.indexOf(correct),
        explain: row[5],
        key: key,
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
    const item = list[Math.floor(rand() * list.length)];
    // Final safety: never serve a leaking question
    if (item && questionLeaksAnswer(item.q, item.choices[item.correct])) {
      for (let i = 0; i < list.length; i++) {
        if (!questionLeaksAnswer(list[i].q, list[i].choices[list[i].correct])) return list[i];
      }
    }
    return item;
  }

  global.GATOR_QUESTIONS = {
    BANK: BANK,
    count: BANK.length,
    questionsForLevel: questionsForLevel,
    pickQuestion: pickQuestion,
  };
})(typeof window !== "undefined" ? window : globalThis);
