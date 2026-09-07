export type ProjectLink = { label: string; href: string }

export type Project = {
    /** kebab-case, unique */
    slug: string
    title: string
    /** start year */
    year: number
    category: 'web' | 'tools' | '3d-printing' | 'electronics' | 'games'
    /** tech / topics */
    tags: string[]
    /** one sentence, <= 140 chars */
    summary: string
    /** 2-4 sentences: problem, what was built, notable detail */
    description: string
    /** GitHub only where the repository is public; live URLs where one exists */
    links?: ProjectLink[]
    /** '/images/projects/<file>' */
    image?: string
}

export const projects: Project[] = [
    {
        slug: 'blueway',
        title: 'BlueWay',
        year: 2026,
        category: 'web',
        tags: ['React', 'TypeScript', 'MapLibre GL', 'Vite', 'PWA', 'OpenStreetMap'],
        summary: 'An offline-capable map PWA that colour-codes the speed limits on Berlin and Brandenburg waterways.',
        description:
            'Boat speed limits are spread across official lists rather than a map, so they are hard to check while on the water. BlueWay draws lakes, river and canal surfaces, waterway lines and sea marks from OpenStreetMap/OpenSeaMap, colour-coded by the permitted maximum speed, on a MapLibre map with a free OpenFreeMap basemap. Lake zones are cut at runtime with turf so the 100 m shore strip and the open-water core never overlap, and the legend is clickable: pick a speed step or buoy colour and everything else greys out. Every visible layer is a plugin behind one contract, so adding a layer is one file plus a registry entry.',
        image: '/images/projects/blueway.png',
    },
    {
        slug: 'interceptor',
        title: 'Interceptor',
        year: 2026,
        category: 'tools',
        tags: ['Node.js', 'TypeScript', 'TLS', 'WebSocket', 'Security'],
        summary: 'An intercepting HTTP, HTTPS and WebSocket proxy for testing the security of your own web apps.',
        description:
            'A Burp-style proxy small enough to read, built on Node 22 and TypeScript with a single runtime dependency for X.509. It terminates TLS with its own local CA and mints a certificate per hostname, while out-of-scope hosts are tunnelled blind and never decrypted. WebSocket traffic is parsed at frame level rather than tunnelled, so both directions are logged, permessage-deflate payloads are inflated for display, and individual messages can be edited or dropped in flight. It also ships breakpoints, a repeater and 20 passive checks, and by default the application under test sees byte-identical requests.',
    },
    {
        slug: 'netwarden',
        title: 'NetWarden',
        year: 2026,
        category: 'tools',
        tags: ['Laravel', 'PHP', 'MCP', 'SQLite', 'Svelte', 'Home Assistant'],
        summary: 'A local MCP server that gives an AI coding agent typed, logged, access-tiered access to home infrastructure.',
        description:
            'Letting an agent touch Home Assistant and TrueNAS through raw shell commands leaves no record of what was changed. NetWarden wraps both systems as typed MCP tools over stdio and tags each one read or mutating, so the mutating ones are deliberately kept off the allow-list and hit an approval prompt every single time. Every call, approved or not, lands in a local SQLite log that can be queried from the CLI, from an MCP tool or from the dashboard. The dashboard also imports any OpenAPI description, so a further service becomes tools without new code, with versioning, rollback and an audit trail behind it.',
        image: '/images/projects/netwarden.png',
    },
    {
        slug: 'ticktools',
        title: 'TickTools',
        year: 2026,
        category: 'games',
        tags: ['Minecraft', 'Data pack', 'Redstone', 'NBT'],
        summary: 'A Minecraft data pack that records primed TNT tick by tick so a cannon can be scrubbed frame by frame.',
        description:
            'The existing TNT tracers are Forge mods for old Minecraft versions and none of them run on 26.2. TickTools records position, velocity and fuse of primed TNT once per game tick into NBT storage at full double precision, then replays the recording as display-entity markers you can step through one tick at a time, forwards and backwards. Being a vanilla data pack rather than a mod, it needs no JDK, no Gradle and no mixins, and it survives Minecraft updates far better. Only TNT and TNT minecarts are tracked by default; a settings function widens that to falling blocks, items and projectiles.',
    },
    {
        slug: 'quant-broker',
        title: 'Quant Broker',
        year: 2026,
        category: 'games',
        tags: ['JavaScript', 'Cookie Clicker', 'Statistics', 'Modding'],
        summary: 'A Cookie Clicker stock-market assistant that prices each good from its own learned distribution, not a fixed threshold.',
        description:
            'Trading Cookie Clicker\'s stock market on fixed multiples of a resting value ignores that every good moves differently. Quant Broker learns each good\'s price quantiles online from two numbers per good with no history buffer, tracks a cost basis so a sale below the purchase price cannot happen, and recovers the market-wide shock events the game hides. It draws the next 15 minutes into the game\'s own graph as dotted medians with a shaded 10-90 band. Measured against a fixed-threshold reference it returned 28% more net cookies, winning on all 10 seeds tested from a quarter of the traded volume.',
        image: '/images/projects/quant-broker.png',
    },
    {
        slug: '3dp-manager',
        title: 'Project Manager for Obsidian',
        year: 2026,
        category: '3d-printing',
        tags: ['TypeScript', 'Obsidian', 'Spoolman', 'Plugin'],
        summary: 'An Obsidian plugin that turns a project note into a parts list, a filament budget and a print schedule.',
        description:
            'Planning a multi-part 3D print means juggling part counts, spool stock and printer time in your head. This plugin renders code blocks in a note into live dashboards: a parts list with print progress synced from a Kanban board, a filament summary that aggregates usage per spool against what Spoolman says is left, and a schedule that plans the prints into days using a configurable work window with setup and cooldown overhead. Spool chips carry colour indicators and hover details, and overflowing prints are flagged rather than silently split.',
        links: [{ label: 'GitHub', href: 'https://github.com/itCarl/obsidian-project-manager' }],
        image: '/images/projects/3dp-manager.png',
    },
    {
        slug: 'filamentdb',
        title: 'FilamentDB',
        year: 2026,
        category: '3d-printing',
        tags: ['PowerShell', 'Spoolman', 'JSON', 'CLI'],
        summary: 'A curated filament database and import CLI for Spoolman: 264 filaments across four vendors.',
        description:
            'Typing filament data into Spoolman by hand is tedious and never quite complete. FilamentDB keeps 264 filaments from eSUN, DAS FILAMENT, Prusament and LDO as SpoolmanDB-compatible JSON, extended with prices, article numbers and engineering data. A PowerShell CLI imports the whole set or a single vendor, offers a dry run before touching the server, and can scan an existing Spoolman instance for duplicates.',
    },
    {
        slug: 'reflowplate',
        title: 'ReflowPlate',
        year: 2025,
        category: 'electronics',
        tags: ['ESP32', 'C++', 'PID', 'REST API', 'WebSocket'],
        summary: 'ESP32 firmware that drives a reflow hotplate for solder paste and PCB pre-heating, with a web UI.',
        description:
            'Reflowing SMD boards on a hotplate needs a controlled temperature curve rather than a dial. ReflowPlate runs PID control on an ESP32, supports up to two heating plates and includes thermal protection. Beside the LCD it brings up Wi-Fi and serves a web interface, backed by a REST API and a WebSocket connection for live values.',
        links: [{ label: 'GitHub', href: 'https://github.com/itCarl/ReflowPlate' }],
        image: '/images/projects/reflowplate.png',
    },
    {
        slug: 'pacala',
        title: 'PaCaLa',
        year: 2023,
        category: 'electronics',
        tags: ['WLED', 'ESP8266', 'WS2812', '3D printing', 'Three.js'],
        summary: 'A portable, fully 3D-printed party and camping lamp running WLED on an ESP-based controller.',
        description:
            'PaCaLa is a battery-powered lamp built around WS2812 LEDs and an ESP8266/ESP32 running WLED, so colours, effects and segments are controlled from a phone over Wi-Fi. The housing and diffuser are 3D printed in PLA/PETG, and the spec sheet lists a 7000 mAh (25 Wh) lithium-ion pack charged over USB-C. The repository is the product site that presents it, built with Three.js, Bootstrap and jQuery.',
        links: [
            { label: 'Website', href: 'https://pacala.blubber-lounge.de/' },
            { label: 'GitHub', href: 'https://github.com/itCarl/BlubberLoungePaCaLa' },
        ],
        image: '/images/projects/pacalaBlubberlounge01.webp',
    },
    {
        slug: 'boat-mooring-simulation',
        title: 'Boat Mooring Simulation',
        year: 2025,
        category: 'web',
        tags: ['JavaScript', 'ES modules', 'DOM', 'Simulation'],
        summary: 'A browser tool for simulating how a moored boat moves, with drag-and-droppable attachment points.',
        description:
            'Mooring lines decide how far a boat can drift off the quay, which is easier to reason about by dragging it than on paper. This tool places attachment points you can move around, ties ropes between them and the boat, and clamps the boat to every rope while you drag it, with the current line length shown next to each rope. A rope takes its maximum length from where it was created plus a little slack, so it behaves like a line rather than a rigid link, and the boat can be rotated in place. Written in plain JavaScript ES modules with no framework.',
        links: [{ label: 'GitHub', href: 'https://github.com/itCarl/Boat-Mooring-Simulation' }],
    },
]
