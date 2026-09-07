<script setup lang="ts">
interface GalleryImage {
    src: string
    title: string
    href?: string
}

// Everything in public/images/projects — older work from the 2022 portfolio plus
// screenshots of the projects written up in the Projects window.
const images: GalleryImage[] = [
    { src: '/images/projects/blueway.png', title: 'BlueWay — brand mark' },
    { src: '/images/projects/netwarden.png', title: 'NetWarden — brand mark' },
    { src: '/images/projects/quant-broker.png', title: 'Quant Broker — Cookie Clicker mod' },
    { src: '/images/projects/3dp-manager.png', title: 'Project Manager for Obsidian — parts list & filament budget', href: 'https://github.com/itCarl/obsidian-project-manager' },
    { src: '/images/projects/reflowplate.png', title: 'ReflowPlate — web UI', href: 'https://github.com/itCarl/ReflowPlate' },
    { src: '/images/projects/bac_mockup03_live.webp', title: 'Airsoft Verein BAC e.V. — Website', href: 'http://bac.maximilian-mewes.de/8dcfd23a-3505-404e-b3c9-e0ae5392805b' },
    { src: '/images/projects/bac_mockup01.webp', title: 'Airsoft Verein BAC e.V. — Device mockup', href: 'http://bac.maximilian-mewes.de/8dcfd23a-3505-404e-b3c9-e0ae5392805b' },
    { src: '/images/projects/bac_mockup02.webp', title: 'Airsoft Verein BAC e.V. — Landing page', href: 'http://bac.maximilian-mewes.de/8dcfd23a-3505-404e-b3c9-e0ae5392805b' },
    { src: '/images/projects/pacalaBlubberlounge01.webp', title: 'PaCaLa — PartyCampingLamp', href: 'https://pacala.blubber-lounge.de/' },
    { src: '/images/projects/wled_battery_usermod.webp', title: "WLED 'Battery' usermod", href: 'https://github.com/Aircoookie/WLED/tree/main/usermods/Battery' },
    { src: '/images/projects/controller.webp', title: 'LED controller v1 — ESP8266 shield' },
    { src: '/images/projects/blubber_lounge_sticker_pile.webp', title: 'Blubber Lounge — Stickers', href: 'https://blubber-lounge.de/' },
    { src: '/images/projects/blubberLounge_logo.webp', title: 'Blubber Lounge — Logo', href: 'https://blubber-lounge.de/' },
    { src: '/images/projects/PaCaLa_hex_round_V1.webp', title: 'PaCaLa — Rendering', href: 'https://pacala.blubber-lounge.de/' },
    { src: '/images/projects/rc_idea01_thicker_rainbow_things.webp', title: 'Aten / PaCaLa — Logo', href: 'https://pacala.blubber-lounge.de/' },
    { src: '/images/projects/rc_idea01_thicker_rainbow_things02.webp', title: 'Aten / PaCaLa — Logo variant', href: 'https://pacala.blubber-lounge.de/' },
    { src: '/images/projects/lonleytunes.webp', title: 'Lonely Tunes' },
    { src: '/images/projects/wifi_keys01.webp', title: 'NFC WiFi Keys — 3D print' },
    { src: '/images/projects/wop_car_keychains.webp', title: 'World of Pizza keychains — 3D print' },
    { src: '/images/projects/greys_anatomy.gif', title: "Grey's Anatomy lamp — 3D print" },
    { src: '/images/projects/hookah_coaster01.webp', title: 'Hookah Coaster — 3D print' },
    { src: '/images/projects/hookah_coaster02.webp', title: 'Hookah Coaster — lit up' },
    { src: '/images/projects/mc_dia_pickaxe.webp', title: 'Minecraft Diamond Pickaxe — 3D print' },
    { src: '/images/projects/mc_dia_pickaxe_animation.webp', title: 'Minecraft Diamond Pickaxe — LED animation' },
    { src: '/images/projects/lithophane01.webp', title: 'Lithophane — 3D print' },
    { src: '/images/projects/title_image_lithophane.PNG', title: 'Lithophane stand — CAD render' },
    { src: '/images/projects/blubber_lounge_fridge_magnet.webp', title: 'Blubber Lounge — Fridge magnet', href: 'https://blubber-lounge.de/' },
    { src: '/images/projects/vcc_west_brb_logo.webp', title: 'VCC West Brandenburg — Logo' },
    { src: '/images/projects/title_image_can.PNG', title: 'Fridge can organizer — CAD render' },
    { src: '/images/projects/gadze01.webp', title: 'Gadze — photography' },
]
</script>

<template>
    <div class="p-6">
        <h2 class="mb-1 text-xl font-bold text-ink dark:text-foreground">Images</h2>
        <p class="mb-4 text-sm text-mute">
            A visual overview — web, 3D printing, electronics &amp; design. Click the linked ones to
            open, or read the write-ups in <strong>Projects</strong>.
        </p>

        <!-- masonry: preserves each image's natural aspect ratio, no cropping -->
        <div class="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
            <component
                :is="p.href ? 'a' : 'div'"
                v-for="p in images"
                :key="p.src"
                v-bind="p.href ? { href: p.href, target: '_blank', rel: 'noopener noreferrer' } : {}"
                :title="p.title"
                class="press block break-inside-avoid overflow-hidden rounded-md border border-hairline bg-card"
            >
                <img
                    :src="p.src"
                    :alt="p.title"
                    loading="lazy"
                    class="block w-full bg-surface-soft"
                />
                <div class="truncate px-2 py-1 text-xs text-body dark:text-foreground">{{ p.title }}</div>
            </component>
        </div>
    </div>
</template>
