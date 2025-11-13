export const documentationData = {
  overview: {
    title: "Sandbox RP Framework",
    version: "2.0",
    description: "A heavily modified Mythic Framework for GTA V FiveM roleplay servers",
    stats: {
      resources: 77,
      sandboxResources: 63,
      oxResources: 6,
      cfxResources: 5,
      standaloneResources: 3,
      maxPlayers: 10,
      codeLines: "100,000+",
    },
    features: [
      "Advanced character system with full customization",
      "Comprehensive job and employment framework",
      "Property and housing management",
      "Vehicle ownership and customization",
      "Police and emergency services",
      "Business and economy system",
      "Crime and contraband mechanics",
      "Built-in anti-cheat system",
      "React-based UI components",
      "OX Ecosystem integration",
    ],
  },

  gettingStarted: {
    title: "Getting Started",
    sections: [
      {
        title: "Installation",
        content: `Follow these steps to set up the Sandbox RP Framework:

1. **Prerequisites**
   - FiveM Server (build 3407 or higher)
   - MariaDB/MySQL Database
   - Node.js 16+ (for UI resources)
   - CFX License Key

2. **Database Setup**
   - Open HeidiSQL or your preferred MySQL client
   - Create a new database named 'sandbox'
   - Import the database.sql file (358MB)
   - Update database.prod.cfg with your credentials

3. **Server Configuration**
   - Copy server/ directory to your FiveM server
   - Edit server/config/database.prod.cfg
   - Set your sv_licenseKey in server.prod.cfg
   - Configure Discord webhook (optional)

4. **Starting the Server**
   - Run: FXServer.exe +exec server.prod.cfg
   - Connect to localhost:30120
   - Default admin roles set in permissions.cfg`,
      },
      {
        title: "Configuration",
        content: `Key configuration files and their purposes:

**core.prod.cfg** - Production environment settings
- Server name, description, and locale
- Tags for server listing
- Logging level configuration
- API endpoints and feature flags

**permissions.cfg** - Role definitions
- management: Full access to all systems
- dev: Development and testing access
- admin: Standard admin permissions
- operations: Limited administrative access

**resources.cfg** - Resource loading order
- 77 resources loaded in specific sequence
- Dependencies managed automatically
- Critical: Managers → Core → Features

**database.prod.cfg** - Database connection
- MySQL host, port, username, password
- Database name and connection pooling`,
      },
      {
        title: "Architecture",
        content: `The framework follows a modular architecture:

**Core Layer** (sandbox-base)
- Framework initialization
- Player management
- Callback system
- Logging and error handling
- Network synchronization

**Data Layer** (oxmysql)
- Database abstraction
- Query execution
- Connection pooling
- Transaction management

**UI Layer** (React components)
- Character creation
- Admin panels
- Mobile phone
- MDT (Police dispatch)
- Business management

**Feature Layer** (Individual resources)
- Jobs, vehicles, properties
- Crime systems, police
- Businesses, economy
- Entertainment, utilities`,
      },
    ],
  },

  coreFramework: {
    title: "Core Framework",
    resources: [
      {
        id: "sandbox-base",
        name: "Sandbox Base",
        path: "server/resources/[sandbox]/sandbox-base/",
        description: "The core framework resource providing essential systems and exports for all other resources",
        category: "Core",
        features: [
          "Player object management",
          "Callback system (client/server)",
          "Logging system with multiple targets",
          "Routing and bucket management",
          "Cron/scheduled tasks",
          "Punishment system (bans/kicks)",
          "Web API integration",
          "Discord webhook support",
        ],
        structure: [
          "core/ - Core system files (client, server, shared)",
          "exports/ - Public API exports",
          "fxmanifest.lua - Resource manifest",
          "sv_config.lua - Server configuration",
        ],
        exports: [
          {
            name: "GetSbfwVersion",
            type: "function",
            returns: "string",
            description: "Returns the framework version",
            example: `local version = exports["sandbox-base"]:GetSbfwVersion()
print("Framework version: " .. version)`,
          },
          {
            name: "GetPlayer",
            type: "function",
            params: ["source: number"],
            returns: "PlayerObject",
            description: "Get player object by server ID",
            example: `local player = exports["sandbox-base"]:GetPlayer(source)
if player then
    local firstName = player:GetData("FirstName")
    local lastName = player:GetData("LastName")
    print("Player: " .. firstName .. " " .. lastName)
end`,
          },
          {
            name: "GetAllPlayers",
            type: "function",
            returns: "table<PlayerObject>",
            description: "Get all active player objects",
            example: `local players = exports["sandbox-base"]:GetAllPlayers()
for _, player in ipairs(players) do
    local name = player:GetData("FirstName")
    print("Player: " .. name)
end`,
          },
          {
            name: "RegisterServerCallback",
            type: "function",
            params: ["event: string", "callback: function"],
            description: "Register a server callback that clients can call",
            example: `exports["sandbox-base"]:RegisterServerCallback("MyResource:GetData", function(source, data, cb)
    local player = exports["sandbox-base"]:GetPlayer(source)
    if player then
        local result = {
            name = player:GetData("FirstName"),
            job = player:GetData("Job"),
        }
        cb(result)
    else
        cb(nil)
    end
end)`,
          },
          {
            name: "DoServerCallback",
            type: "function",
            params: ["event: string", "data: any", "callback: function"],
            description: "Call a server callback from client",
            example: `-- Client-side
exports["sandbox-base"]:DoServerCallback("MyResource:GetData", {}, function(result)
    if result then
        print("Player name: " .. result.name)
        print("Player job: " .. result.job)
    end
end)`,
          },
          {
            name: "LoggerInfo",
            type: "function",
            params: ["component: string", "message: string", "flags: table", "data: table"],
            description: "Log an informational message",
            example: `exports["sandbox-base"]:LoggerInfo("MyResource", "Player performed action", {
    console = true,
    file = true,
    discord = false,
}, {
    player = source,
    action = "example"
})`,
          },
          {
            name: "LoggerError",
            type: "function",
            params: ["component: string", "message: string", "flags: table", "data: table"],
            description: "Log an error message",
            example: `exports["sandbox-base"]:LoggerError("MyResource", "Failed to process request", {
    console = true,
    file = true,
    discord = true,
}, {
    error = err,
    player = source
})`,
          },
          {
            name: "AddPlayerToRoute",
            type: "function",
            params: ["source: number", "route: number", "force: boolean"],
            description: "Move player to a specific routing bucket",
            example: `-- Move player to private instance (apartment, property, etc.)
local routeId = 100 + source
exports["sandbox-base"]:AddPlayerToRoute(source, routeId, true)`,
          },
          {
            name: "RoutePlayerToGlobalRoute",
            type: "function",
            params: ["source: number"],
            description: "Return player to the global routing bucket",
            example: `-- Return player to main world
exports["sandbox-base"]:RoutePlayerToGlobalRoute(source)`,
          },
          {
            name: "CronRegister",
            type: "function",
            params: ["id: string", "day: string", "hour: number", "minute: number", "callback: function"],
            description: "Register a scheduled task",
            example: `-- Run task daily at 3:00 AM
exports["sandbox-base"]:CronRegister("daily-cleanup", "*", 3, 0, function()
    print("Running daily cleanup...")
    -- Cleanup code here
end)`,
          },
          {
            name: "PunishmentBanSource",
            type: "function",
            params: ["source: number", "duration: number", "reason: string", "component: string"],
            description: "Ban a player from the server",
            example: `-- Ban player for 7 days
exports["sandbox-base"]:PunishmentBanSource(source, 604800, "Cheating", "AntiCheat")`,
          },
        ],
        events: [
          {
            name: "Characters:Server:Loaded",
            type: "server",
            description: "Triggered when a character is fully loaded",
            example: `AddEventHandler("Characters:Server:Loaded", function(source, character)
    print("Character loaded: " .. character.FirstName)
end)`,
          },
          {
            name: "Characters:Client:Spawn",
            type: "client",
            description: "Triggered when character spawns in the world",
            example: `AddEventHandler("Characters:Client:Spawn", function()
    print("Character spawned!")
    -- Initialize client-side systems
end)`,
          },
        ],
      },
      {
        id: "sandbox-pwnzor",
        name: "Pwnzor Anti-Cheat",
        path: "server/resources/[sandbox]/sandbox-pwnzor/",
        description: "Advanced anti-cheat system protecting against exploits and unauthorized modifications",
        category: "Core",
        features: [
          "Script execution monitoring",
          "Exploit detection and prevention",
          "Client-side cheat prevention",
          "Resource integrity checking",
          "Automatic ban system",
          "Real-time threat detection",
        ],
        implementation: `All resources must include the anti-cheat check:

\`\`\`lua
-- In fxmanifest.lua
client_script("@sandbox-pwnzor/client/check.lua")
\`\`\`

This ensures all client scripts are protected against tampering.`,
      },
      {
        id: "sandbox-queue",
        name: "Queue System",
        path: "server/resources/[sandbox]/sandbox-queue/",
        description: "Player connection queue with priority system",
        category: "Core",
        features: [
          "Connection queue management",
          "Priority queue for staff",
          "Whitelist integration",
          "Queue position tracking",
          "Automatic queue processing",
        ],
      },
      {
        id: "sandbox-loadscreen",
        name: "Loading Screen",
        path: "server/resources/[sandbox]/sandbox-loadscreen/",
        description: "Custom loading screen displayed while connecting to server",
        category: "Core",
        features: [
          "Custom branded loading interface",
          "Progress indication",
          "Server information display",
          "Music/audio support",
        ],
      },
    ],
  },

  characterSystem: {
    title: "Character System",
    resources: [
      {
        id: "sandbox-characters",
        name: "Characters",
        path: "server/resources/[sandbox]/sandbox-characters/",
        description: "Complete character creation, management, and persistence system",
        category: "Character",
        features: [
          "Character creation with customization",
          "Multiple characters per account",
          "Appearance customization (face, hair, clothes)",
          "Character data persistence",
          "Reputation system",
          "Character deletion",
          "Spawn location management",
        ],
        structure: [
          "client/ - Client-side character logic",
          "  ├─ main.lua - Main character handler",
          "  ├─ appearance.lua - Appearance customization",
          "  ├─ anim.lua - Character animations",
          "  └─ components/ - UI components",
          "server/ - Server-side management",
          "  ├─ startup.lua - Initialization",
          "  ├─ component.lua - Character component",
          "  ├─ callbacks.lua - Client callbacks",
          "  ├─ store.lua - Data storage",
          "  └─ reputation.lua - Reputation tracking",
          "ui/ - React character creation UI",
        ],
        exports: [
          {
            name: "GetCurrentCharacter",
            type: "function",
            returns: "CharacterObject",
            description: "Get the current character data for local player",
            example: `local character = exports["sandbox-characters"]:GetCurrentCharacter()
if character then
    print("Playing as: " .. character.FirstName .. " " .. character.LastName)
end`,
          },
        ],
        events: [
          {
            name: "Characters:Client:Spawn",
            type: "client",
            description: "Fired when character spawns into the world",
            example: `AddEventHandler("Characters:Client:Spawn", function()
    -- Initialize character-specific client systems
    TriggerEvent("Status:Client:Load")
    TriggerEvent("HUD:Client:Show")
end)`,
          },
          {
            name: "Characters:Client:Updated",
            type: "client",
            description: "Fired when character data is updated",
            example: `AddEventHandler("Characters:Client:Updated", function(key, value)
    print("Character updated: " .. key .. " = " .. tostring(value))
end)`,
          },
          {
            name: "Characters:Server:Created",
            type: "server",
            description: "Fired when a new character is created",
            example: `AddEventHandler("Characters:Server:Created", function(source, character)
    exports["sandbox-base"]:LoggerInfo("Characters", "New character created", {
        file = true,
    }, {
        player = source,
        character = character.ID,
    })
end)`,
          },
        ],
        database: {
          tables: ["characters", "character_data", "character_reputation"],
          columns: {
            characters: [
              "ID - Unique character ID",
              "AccountID - Owner account ID",
              "FirstName - Character first name",
              "LastName - Character last name",
              "Gender - Character gender",
              "DOB - Date of birth",
              "Created - Creation timestamp",
              "LastPlayed - Last login timestamp",
            ],
          },
        },
      },
      {
        id: "sandbox-ped",
        name: "Pedestrian System",
        path: "server/resources/[sandbox]/sandbox-ped/",
        description: "Pedestrian and NPC management system",
        category: "Character",
        features: [
          "Ped model management",
          "Animation handling",
          "Ped spawning and despawning",
          "Scenario management",
        ],
      },
      {
        id: "sandbox-pedinteraction",
        name: "Pedestrian Interaction",
        path: "server/resources/[sandbox]/sandbox-pedinteraction/",
        description: "Interaction system for NPCs and pedestrians",
        category: "Character",
        features: [
          "NPC dialogue system",
          "Quest/mission NPCs",
          "Shop keeper interactions",
          "Service provider NPCs",
        ],
      },
    ],
  },

  jobSystem: {
    title: "Job & Employment System",
    resources: [
      {
        id: "sandbox-jobs",
        name: "Jobs Framework",
        path: "server/resources/[sandbox]/sandbox-jobs/",
        description: "Core job assignment and management system",
        category: "Jobs",
        features: [
          "Job assignment and tracking",
          "Multiple job types support",
          "Job progression system",
          "Salary and payment processing",
          "Job-specific permissions",
          "Duty on/off system",
          "Workgroup management",
        ],
        structure: [
          "client/ - Client job handling",
          "server/ - Server job management",
          "  ├─ jobs.lua - Job definitions",
          "  ├─ component.lua - Job component",
          "  ├─ middleware.lua - Job validation",
          "  └─ threads.lua - Job processing",
          "config/defaultJobs/ - Default job configs",
          "  ├─ police.lua",
          "  ├─ mechanic.lua",
          "  ├─ taxi.lua",
          "  └─ [other jobs]",
        ],
        jobTypes: [
          {
            name: "Police Department",
            description: "Law enforcement with ranks, dispatch, and equipment",
            ranks: ["Cadet", "Officer", "Senior Officer", "Sergeant", "Lieutenant", "Captain", "Chief"],
          },
          {
            name: "Mechanic",
            description: "Vehicle repair and customization service",
            ranks: ["Apprentice", "Mechanic", "Senior Mechanic", "Master Mechanic", "Shop Owner"],
          },
          {
            name: "Taxi Driver",
            description: "Passenger transportation service",
            ranks: ["Driver", "Senior Driver", "Supervisor", "Manager"],
          },
          {
            name: "Restaurant Staff",
            description: "Food service and restaurant operations",
            ranks: ["Server", "Cook", "Head Chef", "Manager", "Owner"],
          },
          {
            name: "Labor Worker",
            description: "Basic labor jobs for quick income",
            ranks: ["Worker"],
          },
        ],
        exports: [
          {
            name: "GetJob",
            type: "function",
            params: ["source: number"],
            returns: "JobObject",
            description: "Get player's current job",
            example: `local job = exports["sandbox-jobs"]:GetJob(source)
if job then
    print("Job: " .. job.Name)
    print("Rank: " .. job.Grade.Name)
end`,
          },
          {
            name: "SetJob",
            type: "function",
            params: ["source: number", "jobId: string", "gradeId: number"],
            description: "Assign a job to a player",
            example: `-- Hire player as police officer
exports["sandbox-jobs"]:SetJob(source, "police", 1)`,
          },
        ],
      },
      {
        id: "sandbox-labor",
        name: "Labor Jobs",
        path: "server/resources/[sandbox]/sandbox-labor/",
        description: "Simple labor jobs for quick income",
        category: "Jobs",
        features: [
          "Delivery missions",
          "Collection tasks",
          "Basic labor work",
          "No job requirement",
          "Quick payment system",
        ],
      },
      {
        id: "sandbox-mechanic",
        name: "Mechanic Job",
        path: "server/resources/[sandbox]/sandbox-mechanic/",
        description: "Vehicle repair and maintenance job",
        category: "Jobs",
        features: [
          "Vehicle repair system",
          "Part replacement",
          "Diagnostic tools",
          "Custom shop management",
          "Service pricing",
        ],
      },
      {
        id: "sandbox-police",
        name: "Police Department",
        path: "server/resources/[sandbox]/sandbox-police/",
        description: "Law enforcement job with full police features",
        category: "Jobs",
        features: [
          "Patrol system",
          "Arrest mechanics",
          "Citation issuance",
          "Evidence collection",
          "Police equipment",
          "Vehicle sirens and lights",
          "Backup request system",
        ],
      },
      {
        id: "sandbox-taxi",
        name: "Taxi Service",
        path: "server/resources/[sandbox]/sandbox-taxi/",
        description: "Passenger transportation service",
        category: "Jobs",
        features: [
          "Passenger pickup system",
          "Fare calculation",
          "GPS navigation",
          "Taxi meter",
          "Rating system",
        ],
      },
      {
        id: "sandbox-restaurant",
        name: "Restaurant Jobs",
        path: "server/resources/[sandbox]/sandbox-restaurant/",
        description: "Food service and restaurant operations",
        category: "Jobs",
        features: [
          "Cooking system",
          "Order management",
          "Food preparation",
          "Customer service",
          "Menu management",
        ],
      },
    ],
  },

  propertySystem: {
    title: "Property & Housing System",
    resources: [
      {
        id: "sandbox-properties",
        name: "Properties",
        path: "server/resources/[sandbox]/sandbox-properties/",
        description: "Complete property ownership and management system with 888 lines of callbacks",
        category: "Property",
        features: [
          "Property purchase and sale",
          "Interior customization",
          "Furniture placement system",
          "Storage safes",
          "Rental system",
          "Property access control",
          "Multiple property types",
          "Property insurance",
        ],
        structure: [
          "client/ - Property client logic",
          "  ├─ main.lua - Main handler",
          "  ├─ visuals.lua - Visual effects",
          "  └─ callbacks.lua - Client callbacks",
          "server/ - Property server management",
          "  ├─ callbacks.lua - 888 lines of operations",
          "  ├─ component.lua - Property component",
          "  └─ commands.lua - Admin commands",
          "interiors/ - Interior definitions",
          "ui/ - Property management UI",
        ],
        propertyTypes: [
          {
            name: "Houses",
            description: "Single-family homes with yards",
            features: ["Multiple rooms", "Garage", "Storage", "Customizable"],
          },
          {
            name: "Apartments",
            description: "Multi-unit housing buildings",
            features: ["Compact living", "Shared building", "Various tiers"],
          },
          {
            name: "Mansions",
            description: "Luxury properties with extensive amenities",
            features: ["Multiple floors", "Large space", "Premium locations"],
          },
          {
            name: "Businesses",
            description: "Commercial properties",
            features: ["Storefronts", "Offices", "Warehouses"],
          },
        ],
        exports: [
          {
            name: "GetProperty",
            type: "function",
            params: ["propertyId: number"],
            returns: "PropertyObject",
            description: "Get property data by ID",
            example: `local property = exports["sandbox-properties"]:GetProperty(1)
if property then
    print("Property: " .. property.Name)
    print("Owner: " .. property.Owner)
end`,
          },
          {
            name: "PurchaseProperty",
            type: "function",
            params: ["source: number", "propertyId: number"],
            description: "Purchase a property",
            example: `-- Server-side
exports["sandbox-properties"]:PurchaseProperty(source, propertyId)`,
          },
        ],
      },
      {
        id: "sandbox-apartments",
        name: "Apartments",
        path: "server/resources/[sandbox]/sandbox-apartments/",
        description: "Apartment-specific housing system",
        category: "Property",
        features: [
          "Multiple apartment complexes",
          "Apartment tiers (low, medium, high)",
          "Spawn point management",
          "Shared building entrances",
          "Apartment numbering system",
        ],
      },
    ],
  },

  vehicleSystem: {
    title: "Vehicle System",
    resources: [
      {
        id: "sandbox-vehicles",
        name: "Vehicles",
        path: "server/resources/[sandbox]/sandbox-vehicles/",
        description: "Comprehensive vehicle management system with 890 callback lines",
        category: "Vehicles",
        features: [
          "Vehicle ownership tracking",
          "Key management system",
          "Vehicle persistence",
          "Personal license plates",
          "Vehicle identification",
          "Damage tracking",
          "Vehicle synchronization",
          "Anti-theft measures",
        ],
        structure: [
          "client/ - Vehicle client systems",
          "  ├─ vehicle.lua - Main logic (37KB)",
          "  ├─ antifuck.lua - Anti-cheat measures",
          "  ├─ utilities/ - Helper functions",
          "  └─ modules/ - Vehicle modules",
          "server/ - Vehicle server management",
          "  ├─ callbacks.lua - 890 lines",
          "  ├─ keys.lua - Key system",
          "  ├─ models.lua - Vehicle models",
          "  ├─ personal_plates.lua - Custom plates",
          "  └─ sync.lua - Synchronization",
          "stream/ - Vehicle asset files",
        ],
        exports: [
          {
            name: "GetVehicleByVIN",
            type: "function",
            params: ["vin: string"],
            returns: "VehicleObject",
            description: "Get vehicle data by VIN",
            example: `local vehicle = exports["sandbox-vehicles"]:GetVehicleByVIN("ABC123456")
if vehicle then
    print("Vehicle: " .. vehicle.Make .. " " .. vehicle.Model)
    print("Owner: " .. vehicle.Owner)
end`,
          },
          {
            name: "GiveKeys",
            type: "function",
            params: ["source: number", "vin: string"],
            description: "Give vehicle keys to a player",
            example: `exports["sandbox-vehicles"]:GiveKeys(source, vehicleVIN)`,
          },
          {
            name: "HasKeys",
            type: "function",
            params: ["source: number", "vin: string"],
            returns: "boolean",
            description: "Check if player has keys to vehicle",
            example: `local hasKeys = exports["sandbox-vehicles"]:HasKeys(source, vehicleVIN)
if hasKeys then
    -- Allow vehicle access
end`,
          },
        ],
      },
      {
        id: "sandbox-dealerships",
        name: "Dealerships",
        path: "server/resources/[sandbox]/sandbox-dealerships/",
        description: "Vehicle sales and financing system",
        category: "Vehicles",
        features: [
          "Vehicle showrooms",
          "Test drives",
          "Financing options",
          "Trade-in system",
          "Vehicle browsing",
          "Purchase processing",
        ],
      },
      {
        id: "sandbox-customs",
        name: "Customs",
        path: "server/resources/[sandbox]/sandbox-customs/",
        description: "Vehicle customization and modification",
        category: "Vehicles",
        features: [
          "Visual customization",
          "Performance upgrades",
          "Paint jobs and wraps",
          "Wheel changes",
          "Window tinting",
          "Neon lights",
        ],
      },
      {
        id: "sandbox-fuel",
        name: "Fuel System",
        path: "server/resources/[sandbox]/sandbox-fuel/",
        description: "Vehicle fuel management",
        category: "Vehicles",
        features: [
          "Fuel consumption",
          "Gas station locations",
          "Refueling mechanics",
          "Fuel prices",
          "Jerry can system",
        ],
      },
      {
        id: "sandbox-tow",
        name: "Tow Service",
        path: "server/resources/[sandbox]/sandbox-tow/",
        description: "Vehicle towing and impound system",
        category: "Vehicles",
        features: [
          "Flatbed towing",
          "Impound management",
          "Vehicle recovery",
          "Tow job integration",
        ],
      },
      {
        id: "sandbox-fitment",
        name: "Fitment Shop",
        path: "server/resources/[sandbox]/sandbox-fitment/",
        description: "Advanced vehicle fitment and stance customization",
        category: "Vehicles",
        features: [
          "Wheel offset adjustment",
          "Suspension height",
          "Camber adjustment",
          "Track width modification",
        ],
      },
    ],
  },

  policeSystem: {
    title: "Police & Law Enforcement",
    resources: [
      {
        id: "sandbox-mdt",
        name: "Mobile Data Terminal",
        path: "server/resources/[sandbox]/sandbox-mdt/",
        description: "Police dispatch and management system with React interface",
        category: "Police",
        features: [
          "Dispatch system",
          "Call management",
          "Officer tracking",
          "Warrant management",
          "Arrest records",
          "Citation system",
          "Criminal database",
          "Vehicle registration lookup",
          "Person search",
        ],
        structure: [
          "client/ - MDT client logic",
          "server/ - Dispatch handlers",
          "  ├─ dashboard.lua - Dashboard data",
          "  ├─ callbacks.lua - MDT callbacks",
          "  └─ commands.lua - Admin commands",
          "ui/ - React MDT interface",
          "  └─ src/ - React components",
        ],
      },
      {
        id: "sandbox-cctv",
        name: "CCTV System",
        path: "server/resources/[sandbox]/sandbox-cctv/",
        description: "Security camera monitoring system",
        category: "Police",
        features: [
          "Camera placement",
          "Live camera feeds",
          "Recording playback",
          "Multiple camera views",
          "Access control",
        ],
      },
      {
        id: "sandbox-radar",
        name: "Radar System",
        path: "server/resources/[sandbox]/sandbox-radar/",
        description: "Police speed radar system",
        category: "Police",
        features: [
          "Speed detection",
          "Front and rear radar",
          "Vehicle identification",
          "Citation integration",
        ],
      },
      {
        id: "sandbox-evidence",
        name: "Evidence System",
        path: "server/resources/[sandbox]/sandbox-evidence/",
        description: "Evidence collection and storage",
        category: "Police",
        features: [
          "Evidence lockers",
          "Item tagging",
          "Chain of custody",
          "Evidence retrieval",
        ],
      },
      {
        id: "sandbox-jail",
        name: "Jail System",
        path: "server/resources/[sandbox]/sandbox-jail/",
        description: "Prison and incarceration mechanics",
        category: "Police",
        features: [
          "Sentencing system",
          "Prison location",
          "Time served tracking",
          "Early release system",
          "Prison activities",
        ],
      },
    ],
  },

  businessSystem: {
    title: "Business & Economy",
    resources: [
      {
        id: "sandbox-businesses",
        name: "Businesses",
        path: "server/resources/[sandbox]/sandbox-businesses/",
        description: "Complete business management system with employee tracking",
        category: "Business",
        features: [
          "Business creation and ownership",
          "Employee management",
          "Financial tracking",
          "Stock management",
          "Security systems",
          "Business permissions",
          "Revenue generation",
        ],
        structure: [
          "client/ - Business client logic",
          "server/ - Business management",
          "config/businesses/ - Business configs",
          "  ├─ taco_shop.lua",
          "  ├─ bank.lua",
          "  └─ [other businesses]",
          "dui/ - Dynamic UI files",
          "  ├─ bowling/ - Bowling alley UI",
          "  └─ tvs/ - TV display UI",
        ],
      },
      {
        id: "sandbox-finance",
        name: "Finance & Banking",
        path: "server/resources/[sandbox]/sandbox-finance/",
        description: "Banking and financial management system",
        category: "Business",
        features: [
          "Bank accounts",
          "Transactions",
          "ATM system",
          "Account transfers",
          "Loan system",
          "Transaction history",
          "Business accounts",
        ],
      },
      {
        id: "sandbox-casino",
        name: "Casino",
        path: "server/resources/[sandbox]/sandbox-casino/",
        description: "Gambling and casino games",
        category: "Business",
        features: [
          "Blackjack tables",
          "Roulette wheels",
          "Slot machines",
          "Poker games",
          "Casino chips",
          "Payout system",
        ],
      },
    ],
  },

  crimeSystem: {
    title: "Crime & Contraband",
    resources: [
      {
        id: "sandbox-weed",
        name: "Weed Farming",
        path: "server/resources/[sandbox]/sandbox-weed/",
        description: "Cannabis cultivation and distribution",
        category: "Crime",
        features: [
          "Weed farm setup",
          "Plant growth system",
          "Harvesting mechanics",
          "Processing stations",
          "Distribution system",
          "Quality tracking",
        ],
      },
      {
        id: "sandbox-drugs",
        name: "Drug Manufacturing",
        path: "server/resources/[sandbox]/sandbox-drugs/",
        description: "Drug production and trafficking",
        category: "Crime",
        features: [
          "Multiple drug types",
          "Manufacturing process",
          "Lab setup",
          "Distribution network",
          "Risk/reward system",
        ],
      },
      {
        id: "sandbox-robbery",
        name: "Robbery System",
        path: "server/resources/[sandbox]/sandbox-robbery/",
        description: "Heist and robbery missions",
        category: "Crime",
        features: [
          "Store robberies",
          "Bank heists",
          "Multi-step missions",
          "Police dispatch integration",
          "Escape mechanics",
          "Loot distribution",
        ],
      },
    ],
  },

  communicationSystem: {
    title: "Communication Systems",
    resources: [
      {
        id: "sandbox-phone",
        name: "Mobile Phone",
        path: "server/resources/[sandbox]/sandbox-phone/",
        description: "In-game mobile phone with 30+ applications",
        category: "Communication",
        features: [
          "Phone calls and SMS",
          "Banking app",
          "Social media (Twitter-like)",
          "Email system",
          "GPS navigation",
          "Camera and photos",
          "Music player",
          "Job finder",
          "Business management",
          "Services directory",
        ],
        apps: [
          {
            name: "Phone",
            description: "Make and receive calls",
            icon: "📞",
          },
          {
            name: "Messages",
            description: "SMS and text messaging",
            icon: "💬",
          },
          {
            name: "Bank",
            description: "Mobile banking",
            icon: "💰",
          },
          {
            name: "Twitter",
            description: "Social media feed",
            icon: "🐦",
          },
          {
            name: "Email",
            description: "Email application",
            icon: "📧",
          },
          {
            name: "Garage",
            description: "Vehicle management",
            icon: "🚗",
          },
          {
            name: "Labor",
            description: "Find labor jobs",
            icon: "🔨",
          },
          {
            name: "Crypto",
            description: "Cryptocurrency trading",
            icon: "₿",
          },
          {
            name: "Dyn8",
            description: "Music streaming service",
            icon: "🎵",
          },
          {
            name: "Chatter",
            description: "Group messaging",
            icon: "💭",
          },
          {
            name: "Documents",
            description: "Document storage",
            icon: "📄",
          },
          {
            name: "Settings",
            description: "Phone configuration",
            icon: "⚙️",
          },
        ],
        structure: [
          "client/apps/ - 30+ phone apps",
          "  ├─ phone.lua - Call system",
          "  ├─ messages.lua - SMS",
          "  ├─ bank.lua - Banking",
          "  ├─ twitter.lua - Social media",
          "  ├─ email.lua - Email",
          "  └─ [25+ more apps]",
          "server/ - Phone server logic",
          "ui/ - React phone interface",
        ],
      },
      {
        id: "sandbox-chat",
        name: "Chat System",
        path: "server/resources/[sandbox]/sandbox-chat/",
        description: "In-game chat with channels and formatting",
        category: "Communication",
        features: [
          "Multiple chat channels",
          "Proximity chat",
          "Private messages",
          "Admin chat",
          "Chat formatting",
          "Emote system",
        ],
      },
      {
        id: "sandbox-voip",
        name: "Voice Chat",
        path: "server/resources/[sandbox]/sandbox-voip/",
        description: "Proximity voice communication",
        category: "Communication",
        features: [
          "3D positional audio",
          "Voice ranges",
          "Radio integration",
          "Phone call audio",
          "Voice indicators",
        ],
      },
      {
        id: "sandbox-radio",
        name: "Radio System",
        path: "server/resources/[sandbox]/sandbox-radio/",
        description: "Radio communication for jobs",
        category: "Communication",
        features: [
          "Radio channels",
          "Channel encryption",
          "Radio items",
          "Job radio integration",
        ],
      },
    ],
  },

  uiSystem: {
    title: "UI & Interface Systems",
    resources: [
      {
        id: "sandbox-hud",
        name: "HUD Display",
        path: "server/resources/[sandbox]/sandbox-hud/",
        description: "Head-up display showing player information",
        category: "UI",
        features: [
          "Health and armor bars",
          "Stamina display",
          "Hunger and thirst",
          "Cash display",
          "Vehicle speedometer",
          "Location display",
          "Compass",
        ],
      },
      {
        id: "sandbox-menu",
        name: "Menu System",
        path: "server/resources/[sandbox]/sandbox-menu/",
        description: "UI menu framework for interactions",
        category: "UI",
        features: [
          "Context menus",
          "Radial menus",
          "Input dialogs",
          "Confirmation prompts",
          "List selections",
        ],
      },
      {
        id: "sandbox-blips",
        name: "Map Blips",
        path: "server/resources/[sandbox]/sandbox-blips/",
        description: "Map marker and blip management",
        category: "UI",
        features: [
          "Job location blips",
          "Business markers",
          "Service locations",
          "Property markers",
          "Custom blip types",
        ],
      },
      {
        id: "sandbox-admin",
        name: "Admin Panel",
        path: "server/resources/[sandbox]/sandbox-admin/",
        description: "Administrative tools and management interface with 25KB menu file",
        category: "UI",
        features: [
          "Player management",
          "Object spawning",
          "Noclip mode",
          "Door lock management",
          "Teleportation tools",
          "Admin commands",
          "Report handling",
        ],
      },
    ],
  },

  gameplaySystem: {
    title: "Gameplay Systems",
    resources: [
      {
        id: "sandbox-status",
        name: "Status System",
        path: "server/resources/[sandbox]/sandbox-status/",
        description: "Player stats and needs tracking",
        category: "Gameplay",
        features: [
          "Health tracking",
          "Stamina system",
          "Hunger and thirst",
          "Stress levels",
          "Status effects",
          "Regeneration system",
        ],
      },
      {
        id: "sandbox-damage",
        name: "Damage System",
        path: "server/resources/[sandbox]/sandbox-damage/",
        description: "Advanced damage and injury mechanics",
        category: "Gameplay",
        features: [
          "Limb damage",
          "Bleeding system",
          "Pain mechanics",
          "Medical treatment",
          "Death system",
        ],
      },
      {
        id: "sandbox-weapons",
        name: "Weapon System",
        path: "server/resources/[sandbox]/sandbox-weapons/",
        description: "Weapon management and mechanics",
        category: "Gameplay",
        features: [
          "Weapon damage",
          "Recoil patterns",
          "Weapon attachments",
          "Ammo types",
          "Weapon licensing",
        ],
      },
      {
        id: "sandbox-animations",
        name: "Animation System",
        path: "server/resources/[sandbox]/sandbox-animations/",
        description: "Emote and animation management",
        category: "Gameplay",
        features: [
          "Emote menu",
          "Custom animations",
          "Shared emotes",
          "Scenario animations",
          "Animation canceling",
        ],
      },
      {
        id: "sandbox-games",
        name: "Mini Games",
        path: "server/resources/[sandbox]/sandbox-games/",
        description: "Interactive mini-games and activities",
        category: "Gameplay",
        features: [
          "Lockpicking",
          "Hacking",
          "Thermite puzzle",
          "Memory games",
          "Skill checks",
        ],
      },
    ],
  },

  utilitySystem: {
    title: "Utility Systems",
    resources: [
      {
        id: "sandbox-objects",
        name: "Object Management",
        path: "server/resources/[sandbox]/sandbox-objects/",
        description: "World object spawning and management",
        category: "Utility",
      },
      {
        id: "sandbox-polyzone",
        name: "PolyZone",
        path: "server/resources/[sandbox]/sandbox-polyzone/",
        description: "Area and zone definition system",
        category: "Utility",
      },
      {
        id: "sandbox-sync",
        name: "Synchronization",
        path: "server/resources/[sandbox]/sandbox-sync/",
        description: "Data synchronization between clients",
        category: "Utility",
      },
      {
        id: "sandbox-sounds",
        name: "Sound System",
        path: "server/resources/[sandbox]/sandbox-sounds/",
        description: "Audio and sound effect management",
        category: "Utility",
      },
      {
        id: "sandbox-kbs",
        name: "Keybind System",
        path: "server/resources/[sandbox]/sandbox-kbs/",
        description: "Keyboard binding management",
        category: "Utility",
      },
    ],
  },

  oxEcosystem: {
    title: "OX Ecosystem",
    resources: [
      {
        id: "ox_lib",
        name: "OX Library",
        path: "server/resources/[ox]/ox_lib/",
        description: "Core library providing essential functions and UI components",
        category: "OX",
        features: [
          "Callback system",
          "Math utilities",
          "String functions",
          "Notification system",
          "Progress bars",
          "Input dialogs",
        ],
      },
      {
        id: "ox_inventory",
        name: "OX Inventory",
        path: "server/resources/[ox]/ox_inventory/",
        description: "Advanced inventory management system",
        category: "OX",
        features: [
          "Item storage",
          "Weight system",
          "Item metadata",
          "Container support",
          "Shop system",
          "Crafting system",
        ],
      },
      {
        id: "ox_target",
        name: "OX Target",
        path: "server/resources/[ox]/ox_target/",
        description: "Object and entity interaction system",
        category: "OX",
        features: [
          "Entity targeting",
          "Zone targeting",
          "Model targeting",
          "Interaction menus",
          "Distance checking",
        ],
      },
      {
        id: "ox_doorlock",
        name: "OX Doorlock",
        path: "server/resources/[ox]/ox_doorlock/",
        description: "Door locking and access control",
        category: "OX",
        features: [
          "Door state management",
          "Access permissions",
          "Key system integration",
          "Remote door control",
        ],
      },
      {
        id: "oxmysql",
        name: "OXMySQL",
        path: "server/resources/[ox]/oxmysql/",
        description: "MySQL database wrapper for FiveM",
        category: "OX",
        features: [
          "Async queries",
          "Prepared statements",
          "Transaction support",
          "Connection pooling",
        ],
      },
    ],
  },

  apiReference: {
    title: "API Reference",
    sections: [
      {
        title: "Player API",
        description: "Functions for player management and data access",
        functions: [
          {
            name: "GetPlayer",
            signature: "exports['sandbox-base']:GetPlayer(source: number): PlayerObject",
            description: "Retrieve a player object by their server ID",
            returns: "PlayerObject or nil if not found",
            example: `local player = exports['sandbox-base']:GetPlayer(source)
if player then
    local name = player:GetData('FirstName')
    print('Player name: ' .. name)
end`,
          },
          {
            name: "GetAllPlayers",
            signature: "exports['sandbox-base']:GetAllPlayers(): table",
            description: "Get all active player objects",
            returns: "Table of PlayerObject",
            example: `local players = exports['sandbox-base']:GetAllPlayers()
print('Online players: ' .. #players)`,
          },
        ],
      },
      {
        title: "Character API",
        functions: [
          {
            name: "GetCurrentCharacter",
            signature: "exports['sandbox-characters']:GetCurrentCharacter(): CharacterObject",
            description: "Get the current character for the local player",
            returns: "CharacterObject",
            example: `local char = exports['sandbox-characters']:GetCurrentCharacter()
print('Character: ' .. char.FirstName .. ' ' .. char.LastName)`,
          },
        ],
      },
      {
        title: "Callback API",
        functions: [
          {
            name: "RegisterServerCallback",
            signature: "exports['sandbox-base']:RegisterServerCallback(event: string, callback: function)",
            description: "Register a server callback that clients can invoke",
            example: `exports['sandbox-base']:RegisterServerCallback('MyResource:GetData', function(source, data, cb)
    local result = {success = true}
    cb(result)
end)`,
          },
          {
            name: "DoServerCallback",
            signature: "exports['sandbox-base']:DoServerCallback(event: string, data: any, callback: function)",
            description: "Call a server callback from the client",
            example: `exports['sandbox-base']:DoServerCallback('MyResource:GetData', {}, function(result)
    print('Received: ' .. json.encode(result))
end)`,
          },
        ],
      },
      {
        title: "Logging API",
        functions: [
          {
            name: "LoggerTrace",
            signature: "exports['sandbox-base']:LoggerTrace(component: string, message: string, flags: table, data: table)",
            description: "Log a trace-level message for detailed debugging",
          },
          {
            name: "LoggerInfo",
            signature: "exports['sandbox-base']:LoggerInfo(component: string, message: string, flags: table, data: table)",
            description: "Log an informational message",
          },
          {
            name: "LoggerWarn",
            signature: "exports['sandbox-base']:LoggerWarn(component: string, message: string, flags: table, data: table)",
            description: "Log a warning message",
          },
          {
            name: "LoggerError",
            signature: "exports['sandbox-base']:LoggerError(component: string, message: string, flags: table, data: table)",
            description: "Log an error message",
          },
          {
            name: "LoggerCritical",
            signature: "exports['sandbox-base']:LoggerCritical(component: string, message: string, flags: table, data: table)",
            description: "Log a critical error message",
          },
        ],
      },
    ],
  },

  developerGuide: {
    title: "Developer Guide",
    sections: [
      {
        title: "Creating a New Resource",
        content: `## Step 1: Create Directory Structure

Create a new folder in \`server/resources/[sandbox]/\`:

\`\`\`
sandbox-myresource/
├── client/
│   ├── main.lua
│   ├── callbacks.lua
│   └── events.lua
├── server/
│   ├── main.lua
│   ├── callbacks.lua
│   └── events.lua
├── shared/
│   └── config.lua
├── fxmanifest.lua
└── config.lua
\`\`\`

## Step 2: Create fxmanifest.lua

\`\`\`lua
fx_version("cerulean")
games({ "gta5" })
lua54("yes")

description("Sandbox RP - My Resource")
version("1.0.0")

-- Required for all resources
client_script("@sandbox-base/exports/cl_error.lua")
client_script("@sandbox-pwnzor/client/check.lua")

client_scripts({
    "client/**/*.lua",
})

server_scripts({
    '@oxmysql/lib/MySQL.lua',
    "server/**/*.lua",
})

shared_scripts({
    "shared/config.lua",
})
\`\`\`

## Step 3: Register Callbacks

**Server (server/callbacks.lua):**
\`\`\`lua
exports["sandbox-base"]:RegisterServerCallback("MyResource:GetData", function(source, data, cb)
    local player = exports["sandbox-base"]:GetPlayer(source)
    if not player then
        cb(nil)
        return
    end

    local result = {
        name = player:GetData("FirstName"),
        job = player:GetData("Job")
    }

    cb(result)
end)
\`\`\`

**Client (client/main.lua):**
\`\`\`lua
RegisterCommand("mytest", function()
    exports["sandbox-base"]:DoServerCallback("MyResource:GetData", {}, function(result)
        if result then
            print("Name: " .. result.name)
            print("Job: " .. result.job)
        end
    end)
end)
\`\`\`

## Step 4: Add to resources.cfg

Add your resource to \`server/config/resources.cfg\`:

\`\`\`ini
ensure sandbox-myresource
\`\`\`

## Step 5: Test Your Resource

1. Restart your FiveM server
2. Connect to the server
3. Test your commands and callbacks
4. Check console for errors`,
      },
      {
        title: "Best Practices",
        content: `## Code Organization

1. **Separate Client and Server Logic**
   - Keep client code in client/
   - Keep server code in server/
   - Shared code in shared/

2. **Use Exports for Inter-Resource Communication**
   - Don't directly access other resource functions
   - Use sandbox-base callback system
   - Export public functions properly

3. **Error Handling**
   - Always include error handler
   - Check for nil values
   - Handle edge cases

## Performance

1. **Minimize Threads**
   - Avoid unnecessary CreateThread calls
   - Use event-driven programming
   - Batch operations when possible

2. **Database Queries**
   - Use parameterized queries
   - Cache frequently accessed data
   - Batch database operations

3. **Network Optimization**
   - Minimize TriggerServerEvent calls
   - Use latent events for large data
   - Implement client-side prediction

## Security

1. **Always Validate Input**
   \`\`\`lua
   exports["sandbox-base"]:RegisterServerCallback("MyResource:Action", function(source, data, cb)
       if type(data.amount) ~= "number" then
           cb({success = false, message = "Invalid amount"})
           return
       end

       if data.amount < 0 or data.amount > 1000000 then
           cb({success = false, message = "Amount out of range"})
           return
       end

       -- Process valid request
   end)
   \`\`\`

2. **Server-Side Verification**
   - Never trust client data
   - Verify permissions server-side
   - Check player state before actions

3. **Anti-Cheat Integration**
   - Include @sandbox-pwnzor/client/check.lua
   - Report suspicious activity
   - Use server-authoritative logic`,
      },
      {
        title: "Common Patterns",
        content: `## Player Data Access

\`\`\`lua
-- Server-side
local player = exports["sandbox-base"]:GetPlayer(source)
if player then
    local character = player:GetData("Character")
    local firstName = character.FirstName
    local job = character.Job
end
\`\`\`

## Triggering Events

\`\`\`lua
-- Client to Server
TriggerServerEvent("MyResource:ServerEvent", arg1, arg2)

-- Server to Client
TriggerClientEvent("MyResource:ClientEvent", source, arg1, arg2)

-- Server to All Clients
TriggerClientEvent("MyResource:ClientEvent", -1, arg1, arg2)
\`\`\`

## Database Operations

\`\`\`lua
-- Select query
exports.oxmysql:execute('SELECT * FROM table WHERE id = ?', {id}, function(result)
    if result and #result > 0 then
        print("Found: " .. json.encode(result[1]))
    end
end)

-- Insert query
exports.oxmysql:insert('INSERT INTO table (col1, col2) VALUES (?, ?)', {
    value1, value2
}, function(insertId)
    print("Inserted ID: " .. insertId)
end)

-- Update query
exports.oxmysql:execute('UPDATE table SET col1 = ? WHERE id = ?', {
    newValue, id
}, function(affectedRows)
    print("Updated rows: " .. affectedRows)
end)
\`\`\`

## UI Communication (NUI)

\`\`\`lua
-- Client-side: Send to NUI
SendNUIMessage({
    action = "openUI",
    data = {
        title = "My UI",
        items = itemList
    }
})

-- Client-side: Receive from NUI
RegisterNUICallback("buttonClicked", function(data, cb)
    print("Button clicked: " .. data.buttonId)
    cb("ok")
end)
\`\`\``,
      },
    ],
  },

  troubleshooting: {
    title: "Troubleshooting",
    sections: [
      {
        title: "Common Issues",
        problems: [
          {
            issue: "Resource not starting",
            solutions: [
              "Check fxmanifest.lua syntax",
              "Verify file paths are correct",
              "Check dependencies are loaded first",
              "Review server console for errors",
            ],
          },
          {
            issue: "Database connection failed",
            solutions: [
              "Verify database credentials in database.cfg",
              "Ensure MySQL server is running",
              "Check firewall settings",
              "Test connection with HeidiSQL",
            ],
          },
          {
            issue: "Callbacks not firing",
            solutions: [
              "Verify callback is registered before calling",
              "Check event names match exactly",
              "Ensure sandbox-base is loaded",
              "Review console for errors",
            ],
          },
          {
            issue: "UI not displaying",
            solutions: [
              "Check ui_page path in fxmanifest.lua",
              "Verify files are listed in fxmanifest.lua",
              "Check browser console (F8 in game, type 'resmon')",
              "Rebuild UI with npm run build",
            ],
          },
          {
            issue: "Player data is nil",
            solutions: [
              "Wait for Characters:Client:Spawn event",
              "Verify character is loaded",
              "Check database for character data",
              "Review character creation process",
            ],
          },
        ],
      },
      {
        title: "Debugging Tips",
        content: `## Enable Verbose Logging

In \`sandbox-base/sv_config.lua\`, set logging level to 1 (TRACE):

\`\`\`lua
Config.Logging = 1
\`\`\`

## Use Logger Exports

\`\`\`lua
exports["sandbox-base"]:LoggerTrace("MyResource", "Debug message", {
    console = true,
    file = true
}, {
    data = myData
})
\`\`\`

## Check Console Output

- Server console shows server-side errors
- F8 in-game shows client-side errors
- Use print() statements for debugging

## Database Debugging

\`\`\`lua
exports.oxmysql:execute('SELECT * FROM table', {}, function(result)
    print("Query result: " .. json.encode(result))
end)
\`\`\`

## Network Debugging

Use \`resmon\` command in F8 console to monitor:
- Resource CPU usage
- Network events
- Frame times`,
      },
    ],
  },

  changelog: {
    title: "Changelog",
    versions: [
      {
        version: "2.0.0",
        date: "2024-01-15",
        changes: [
          "Complete framework rewrite based on Mythic Framework",
          "Added OX Ecosystem integration",
          "New React-based UI components",
          "Enhanced anti-cheat system (Pwnzor)",
          "Improved character customization",
          "Advanced vehicle management system",
          "Comprehensive job framework",
          "Business management system",
          "Mobile phone with 30+ apps",
          "Police MDT system",
          "Property and housing system",
          "Crime and contraband mechanics",
        ],
      },
    ],
  },

  credits: {
    title: "Credits & License",
    content: `## Framework Credits

**Sandbox RP Framework v2.0**
- Developer: AutLaaw
- Support: https://ko-fi.com/autlaaw

**Original Framework**
- Based on Mythic Framework
- Created by Alzar & Dr. Nick
- Used with permission

## Dependencies

**OX Ecosystem**
- ox_lib, ox_inventory, ox_target, ox_doorlock
- Created by Overextended
- License: LGPL-3.0

**Other Dependencies**
- FiveM/CitizenFX
- React.js
- Vite/Webpack

## License

This framework is provided for use in FiveM roleplay servers. Please respect the original creators and maintain attribution when using or modifying this framework.

## Community

Join the Sandbox RP community for support, updates, and discussion:
- Discord: [Your Discord Link]
- Documentation: [Your Docs Link]
- GitHub: [Your GitHub Link]`,
  },
};
