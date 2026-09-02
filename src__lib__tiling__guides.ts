export type Guide = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string[];
};

export const GUIDES: Guide[] = [
  {
    id: "setting-out",
    title: "Setting out — where to start",
    category: "Layout",
    summary: "Avoid sliver cuts and keep the room looking centred.",
    body: [
      "Find the most visible wall first — usually opposite the door, or the wall you see from the landing.",
      "Dry-lay a row of tiles plus spacers. If the leftover at both ends is less than a third of a tile, shift the starting joint so both cuts grow.",
      "On floors, centre on the doorway if that is the view you get walking in. Hide small cuts under the bath, vanity or against the least-seen wall.",
      "Strike a level line around the room at the top of the first full row. Never start from an unlevel floor and hope it works out.",
      "External corners, niches and windows should land on a full tile where you can. Internal corners can take a cut.",
    ],
  },
  {
    id: "waste",
    title: "Waste, cuts and ordering",
    category: "Estimating",
    summary: "12% is the usual rule. Patterns and large format need more.",
    body: [
      "Straight stack, simple rectangle: 8–10% is enough if the room is square.",
      "Typical bathrooms with windows, niches and a door: 12% is the safe default.",
      "Brick bond: add about 2%. Diagonal or 45°: add 8–10%. Herringbone: add 10–15%.",
      "Always round up to whole boxes. Keep a labelled spare box from the same batch for future repairs.",
      "Customer-supplied tiles: put the recommended order quantity in writing so shortages are not your problem on the day.",
    ],
  },
  {
    id: "adhesive",
    title: "Adhesive, trowel and coverage",
    category: "Materials",
    summary: "Trowel size is what actually decides how many bags you need.",
    body: [
      "Walls, 300 mm tiles: 8 mm trowel, roughly 4 m² per 20 kg bag.",
      "Floors and 600 mm tiles: 10 mm trowel, closer to 3 m² per bag.",
      "800 mm+ and extra-large format: 12 mm trowel or a pourable S1/S2 adhesive, often 2–2.5 m² per bag, plus back-buttering.",
      "Use C2TE on most interior walls. Use S1 flexible over heated screeds, boards and tanking.",
      "Do not mix more than you can use in 30–40 minutes. Butter the tile as well as the wall on large format.",
    ],
  },
  {
    id: "grout-silicone",
    title: "Grout and silicone",
    category: "Materials",
    summary: "Joint width, depth and wet areas decide the bags and tubes.",
    body: [
      "A 3 mm joint on 300 × 600 uses roughly 0.4–0.6 kg of grout per m². A 5 mm joint uses more.",
      "Showers and wet rooms: mould-resistant or epoxy grout on the tray and splash zone.",
      "Leave a movement gap at the floor/wall junction and fill it with sanitary silicone, not grout.",
      "One 310 ml tube of sanitary silicone covers about 6–8 linear metres of a 6 mm bead.",
      "Tool silicone once. Recess it slightly so it does not catch dirt on the edge of the bath or tray.",
    ],
  },
  {
    id: "waterproofing",
    title: "Waterproofing and wet rooms",
    category: "Wet areas",
    summary: "Tank the wet zone. Tile is not waterproof.",
    body: [
      "Porcelain and grout are water-resistant, not a tanking system. Water will get behind tiles if you skip the membrane.",
      "Shower enclosure: tank the floor of the tray area and walls to at least 2 m, including the outside returns.",
      "Wet room: tank the entire floor, up the walls 100–150 mm as a tray, and the shower walls to full height.",
      "Tape every corner, board joint, pipe penetration and waste. Prime first. Two coats of slurry, second coat at right angles.",
      "Falls to a linear drain should be about 1:80 to 1:100. Check the waste before you board.",
    ],
  },
  {
    id: "substrates",
    title: "Boards, plaster and screed",
    category: "Prep",
    summary: "If the background is wrong, the tiling will fail.",
    body: [
      "Plaster must be fully dry. Prime it. Do not tile onto dusty or weak plaster — PVA skim is a red flag.",
      "Tile-backer board in wet zones, not standard plasterboard. Fix to the manufacturer's centres and tape the joints.",
      "Floors: screed should be dry, sound and within tolerance. Large format needs a flatter floor than 300 mm tiles.",
      "Plywood should be WBP, screw-fixed at close centres, and primed. Many manufacturers prefer tile-backer over ply now.",
      "Underfloor heating: flexible S1 adhesive and grout, movement joints, and the heating commissioned as specified before tiling.",
    ],
  },
  {
    id: "bathroom-refit",
    title: "Bathroom refits",
    category: "Jobs",
    summary: "Tiling is one trade in a longer sequence.",
    body: [
      "Strip, first-fix plumbing and electrics, board, tank, then tile. Sanitaryware sits after tiling unless you are building in a bath panel.",
      "Allow time to strip old tiles and make good. A 4-wall bathroom can take a full day just to strip and bag up.",
      "Confirm who supplies the suite, tray, screen and tiles. Write it on the quote.",
      "Protect the landing and stairs. Agree a skip or waste plan before you start.",
      "Do not book the fitter for the same morning you finish grouting a wet room.",
    ],
  },
  {
    id: "kitchens",
    title: "Kitchens and splashbacks",
    category: "Jobs",
    summary: "Work to the worktop and sockets, not just the wall.",
    body: [
      "Splashbacks usually run from the worktop to the underside of the wall units. Measure after the kitchen is fitted if you can.",
      "Sockets, switches and hob cut-outs eat tiles. Add waste and dry-lay around them.",
      "Use a heat-rated adhesive behind a hob splash. Glass or metal panels are sometimes a cleaner detail than tile here.",
      "Kitchen floors take more impact. Use a suitable floor porcelain and a flexible adhesive.",
      "Silicone the worktop junction, not grout. Colour-match the worktop or the grout, not both.",
    ],
  },
  {
    id: "labour",
    title: "Labour time and quoting",
    category: "Estimating",
    summary: "Smaller tiles take longer. Pattern work takes longer still.",
    body: [
      "As a rule of thumb, 300 × 600 on a clear wall is around 1–1.3 hours per m² including cuts and grout.",
      "Mosaic and 100 mm tiles can be two to three times that. Large format is slower than people expect because of levelling clips and handling.",
      "Herringbone and diagonal layouts add 25–45% labour. Niches, windows and mitred corners add more than area suggests.",
      "Quote a day rate on awkward refits where the m² rate would underprice the prep.",
      "Always price stripping, tanking, levelling and trims as separate lines so the customer can see the job, not just the tile.",
    ],
  },
  {
    id: "site-photos",
    title: "What to look for on a survey",
    category: "Survey",
    summary: "Photos plus measurements beat a guess from memory.",
    body: [
      "Photograph every wall, the floor, the ceiling, the waste, the door swing and the outside of the room.",
      "Check falls, existing cracks, hollow tiles, and whether the bath is built-in or free-standing.",
      "Note who is supplying tiles, whether they are rectified, and the batch. Rectified edges like a tighter 2 mm joint.",
      "Measure twice: wall length at the floor and at the ceiling. Out-of-plumb walls change cut sizes.",
      "Ask about parking, water, power, pets, and whether the bathroom can be out of use.",
    ],
  },
];
