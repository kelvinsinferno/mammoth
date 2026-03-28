export const genSparkline = (trend = 'up', n = 24) => {
  const d = [];
  let v = 40 + Math.random() * 20;
  for (let i = 0; i < n; i++) {
    v = Math.max(4, Math.min(96, v + (Math.random() - (trend === 'up' ? 0.37 : 0.63)) * 11));
    d.push(v);
  }
  return d;
};

export const PROJECTS = [
  { id:"1", name:"MegaTusk", ticker:"TUSK", image:"https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", price:0.00234, change:182.4, volume:84200, status:"ACTIVE", progress:78, sparkline:genSparkline("up"), cycle:2, raised:"240 SOL",
    description:"MegaTusk is a repeat-raise infrastructure layer built on Mammoth Protocol. Each cycle funds a specific milestone — no vague promises, no surprise dilution.",
    supplyMode:"Fixed", totalSupply:1_000_000_000, publicAlloc:600_000_000, treasuryAlloc:400_000_000,
    cycleData:{ id:2, status:"ACTIVE", allocation:100_000, sold:78_000, curveType:"Step", basePrice:0.00180, currentPrice:0.00234, nextStepIn:3_200, nextStepPrice:0.00256, stepSize:5_000, stepIncrement:0.00022, userRights:5_400, userRightsUsed:0, treasuryRouting:{creator:70,reserve:20,sink:10} },
    cycleHistory:[{id:1,allocation:100_000,sold:100_000,status:"COMPLETED",raised:"240 SOL",priceRange:"0.0018–0.0032"},{id:2,allocation:100_000,sold:78_000,status:"ACTIVE",raised:"182 SOL",priceRange:"0.0018–now"}],
    creator:"7xKm...4fQ", createdAt:"2025-03-01", hardCap:true,
    chartData: (() => { const pts=[]; let v=0.0018; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.0010,Math.min(0.0045,v+(Math.random()-0.44)*0.00015));pts.push({t:now-i*3_600_000,p:v})} pts[0].p=0.00180; pts[pts.length-1].p=0.00234; return pts; })(),
  },
  { id:"2", name:"WoollyDAO", ticker:"WOOL", image:"https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif", price:0.00089, change:47.1, volume:31500, status:"ACTIVE", progress:31, sparkline:genSparkline("up"), cycle:1, raised:"62 SOL",
    description:"WoollyDAO is decentralized woolly mammoth preservation infrastructure. The DAO funds conservation research through discrete minting cycles.",
    supplyMode:"Elastic", totalSupply:500_000_000, publicAlloc:300_000_000, treasuryAlloc:200_000_000,
    cycleData:{ id:1, status:"ACTIVE", allocation:80_000, sold:24_800, curveType:"Linear", basePrice:0.00070, currentPrice:0.00089, nextStepIn:null, nextStepPrice:null, stepSize:8_000, stepIncrement:0.00008, userRights:2_100, userRightsUsed:0, treasuryRouting:{creator:60,reserve:30,sink:10} },
    cycleHistory:[{id:1,allocation:80_000,sold:24_800,status:"ACTIVE",raised:"62 SOL",priceRange:"0.0007–now"}],
    creator:"AbC...9xZ", createdAt:"2025-03-08", hardCap:false,
    chartData: (() => { const pts=[]; let v=0.0007; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.0004,Math.min(0.0015,v+(Math.random()-0.43)*0.00008));pts.push({t:now-i*3_600_000,p:v})} pts[0].p=0.00070; pts[pts.length-1].p=0.00089; return pts; })(),
  },
  { id:"3", name:"Glacial Finance", ticker:"GLAC", image:"https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif", price:0.01204, change:-12.3, volume:198000, status:"BETWEEN", progress:100, sparkline:genSparkline("down"), cycle:3, raised:"512 SOL",
    description:"Glacial Finance is a slow-money, fast-gains protocol. Three completed cycles with disciplined allocation sizing and long gaps between raises.",
    supplyMode:"Fixed", totalSupply:2_000_000_000, publicAlloc:1_200_000_000, treasuryAlloc:800_000_000,
    cycleData:{ id:3, status:"ENDED", allocation:200_000, sold:200_000, curveType:"Step", basePrice:0.00600, currentPrice:0.01204, nextStepIn:null, nextStepPrice:null, stepSize:10_000, stepIncrement:0.00040, userRights:0, userRightsUsed:0, treasuryRouting:{creator:75,reserve:15,sink:10} },
    cycleHistory:[{id:1,allocation:200_000,sold:200_000,status:"COMPLETED",raised:"120 SOL",priceRange:"0.006–0.009"},{id:2,allocation:200_000,sold:180_000,status:"TERMINATED",raised:"190 SOL",priceRange:"0.008–0.011"},{id:3,allocation:200_000,sold:200_000,status:"COMPLETED",raised:"512 SOL",priceRange:"0.010–0.013"}],
    creator:"DeF...7mN", createdAt:"2025-01-15", hardCap:true,
    chartData: (() => { const pts=[]; let v=0.006; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.004,Math.min(0.018,v+(Math.random()-0.47)*0.0004));pts.push({t:now-i*3_600_000,p:v})} pts[0].p=0.00600; pts[pts.length-1].p=0.01204; return pts; })(),
  },
  { id:"4", name:"IceAge Protocol", ticker:"ICE", image:"https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif", price:0.00042, change:311.9, volume:9800, status:"ACTIVE", progress:12, sparkline:genSparkline("up"), cycle:1, raised:"14 SOL",
    description:"IceAge Protocol is a primitive capital formation layer. First cycle, early asymmetry, high risk. The market decides everything.",
    supplyMode:"Fixed", totalSupply:1_000_000_000, publicAlloc:600_000_000, treasuryAlloc:400_000_000,
    cycleData:{ id:1, status:"ACTIVE", allocation:50_000, sold:6_000, curveType:"Exp-Lite", basePrice:0.00030, currentPrice:0.00042, nextStepIn:null, nextStepPrice:0.00058, stepSize:5_000, stepIncrement:0.00016, userRights:800, userRightsUsed:0, treasuryRouting:{creator:70,reserve:20,sink:10} },
    cycleHistory:[{id:1,allocation:50_000,sold:6_000,status:"ACTIVE",raised:"14 SOL",priceRange:"0.0003–now"}],
    creator:"GhI...2kP", createdAt:"2025-03-14", hardCap:false,
    chartData: (() => { const pts=[]; let v=0.0003; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.0001,Math.min(0.0008,v+(Math.random()-0.41)*0.00004));pts.push({t:now-i*3_600_000,p:v})} pts[0].p=0.00030; pts[pts.length-1].p=0.00042; return pts; })(),
  },
  { id:"5", name:"Permafrost", ticker:"PRFR", price:0.00399, change:63.2, volume:41800, status:"ACTIVE", progress:55, sparkline:genSparkline("up"), cycle:2, raised:"176 SOL",
    description:"Cold storage for hot narratives. Permafrost uses long gaps between cycles to build credibility and reduce dilution anxiety.",
    supplyMode:"Fixed", totalSupply:800_000_000, publicAlloc:480_000_000, treasuryAlloc:320_000_000,
    cycleData:{ id:2, status:"ACTIVE", allocation:120_000, sold:66_000, curveType:"Step", basePrice:0.00300, currentPrice:0.00399, nextStepIn:4_000, nextStepPrice:0.00421, stepSize:6_000, stepIncrement:0.00022, userRights:3_200, userRightsUsed:0, treasuryRouting:{creator:65,reserve:25,sink:10} },
    cycleHistory:[{id:1,allocation:100_000,sold:100_000,status:"COMPLETED",raised:"176 SOL",priceRange:"0.002–0.004"},{id:2,allocation:120_000,sold:66_000,status:"ACTIVE",raised:"176 SOL",priceRange:"0.003–now"}],
    creator:"JkL...5vR", createdAt:"2025-02-10", hardCap:true,
    chartData: (() => { const pts=[]; let v=0.003; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.001,Math.min(0.007,v+(Math.random()-0.43)*0.00015));pts.push({t:now-i*3_600_000,p:v})} pts[0].p=0.00300; pts[pts.length-1].p=0.00399; return pts; })(),
  },
  { id:"6", name:"HerdProtocol", ticker:"HERD", price:0.00003, change:892.1, volume:3100, status:"ACTIVE", progress:6, sparkline:genSparkline("up"), cycle:1, raised:"2 SOL",
    description:"Move together or get left behind. HerdProtocol is a brand new Cycle 1 with extreme early asymmetry and no prior credibility. Pure speculation.",
    supplyMode:"Elastic", totalSupply:500_000_000, publicAlloc:250_000_000, treasuryAlloc:250_000_000,
    cycleData:{ id:1, status:"ACTIVE", allocation:25_000, sold:1_500, curveType:"Step", basePrice:0.00002, currentPrice:0.00003, nextStepIn:3_500, nextStepPrice:0.000052, stepSize:2_500, stepIncrement:0.000022, userRights:400, userRightsUsed:0, treasuryRouting:{creator:70,reserve:20,sink:10} },
    cycleHistory:[{id:1,allocation:25_000,sold:1_500,status:"ACTIVE",raised:"2 SOL",priceRange:"0.00002–now"}],
    creator:"MnO...8wS", createdAt:"2025-03-16", hardCap:false,
    chartData: (() => { const pts=[]; let v=0.00002; const now=Date.now(); for(let i=168;i>=0;i--){v=Math.max(0.00001,Math.min(0.00006,v+(Math.random()-0.42)*0.000002));pts.push({t:now-i*3_600_000,p:v})} pts[0].p=0.00002; pts[pts.length-1].p=0.00003; return pts; })(),
  },
];

// Named alias — MammothApp.jsx imports MOCK_PROJECTS, data.js exports PROJECTS
export const MOCK_PROJECTS = PROJECTS;
