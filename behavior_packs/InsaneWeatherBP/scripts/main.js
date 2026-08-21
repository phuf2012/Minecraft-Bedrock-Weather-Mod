import { ItemStack, system, world } from "@minecraft/server";

const VERSION = "1.0.0";
const REMOTE_ID = "insane_weather:weather_remote";
const MODES = ["dependent", "clear", "acid_rain", "thunderstorm", "blizzard", "sandstorm", "meteor_shower", "blood_moon"];
const OVERWORLD = "minecraft:overworld";
const MODE_PROPERTY = "insaneWeatherMode";

function say(message) {
  world.sendMessage(`§b[Insane Weather v${VERSION}]§r ${message}`);
}

function overworld() {
  return world.getDimension(OVERWORLD);
}

function rememberMode(mode) {
  try {
    world.setDynamicProperty(MODE_PROPERTY, mode);
  } catch {
    // Dynamic properties can be unavailable on some preview/stable mixes; the active session still works.
  }
}

function getStoredMode() {
  const stored = world.getDynamicProperty(MODE_PROPERTY);
  return MODES.includes(stored) ? stored : "dependent";
}

function commandForMode(mode) {
  if (mode === "clear") return "weather clear 999999";
  if (["acid_rain", "blizzard", "blood_moon", "sandstorm"].includes(mode)) return "weather rain 999999";
  if (["thunderstorm", "meteor_shower"].includes(mode)) return "weather thunder 999999";
  return "weather rain 999999";
}

function runCommand(command) {
  return overworld().runCommandAsync(command).catch(() => undefined);
}

function syncVanillaWeather(mode) {
  const command = commandForMode(mode);
  if (world.getDynamicProperty("insaneWeatherCommand") === command) return;

  runCommand(command);
  try {
    world.setDynamicProperty("insaneWeatherCommand", command);
  } catch {
    // Not fatal; the command may repeat, but the addon continues to function.
  }
}

function setWeather(mode) {
  rememberMode(mode);
  syncVanillaWeather(mode === "dependent" ? "acid_rain" : mode);
  say(`Weather mode set to §e${mode.replaceAll("_", " ")}§r.`);
}

function nextMode(player) {
  if (!player || player.typeId !== "minecraft:player") return;

  const offset = player.isSneaking ? -1 : 1;
  const index = MODES.indexOf(getStoredMode());
  const mode = MODES[(index + offset + MODES.length) % MODES.length];

  setWeather(mode);
  player.onScreenDisplay.setActionBar(`§lWeather Remote§r: ${mode.replaceAll("_", " ")}`);
}

function getDependentMode(player) {
  const time = world.getTimeOfDay();
  const y = Math.floor(player.location.y);

  if (time > 13000 && time < 23000) return "blood_moon";
  if (y > 130) return "blizzard";
  if (y < 45) return "acid_rain";

  const roll = Math.random();
  if (roll < 0.20) return "thunderstorm";
  if (roll < 0.35) return "meteor_shower";
  if (roll < 0.50) return "sandstorm";
  return "acid_rain";
}

function allPlayers() {
  return [...world.getPlayers()].filter((player) => player.dimension.id === OVERWORLD);
}

function safeParticle(player, particle, location) {
  try {
    player.dimension.spawnParticle(particle, location);
  } catch {
    player.dimension.spawnParticle("minecraft:basic_smoke_particle", location);
  }
}

function safeEffect(player, effect, duration, amplifier = 0) {
  try {
    player.addEffect(effect, duration, { amplifier, showParticles: false });
  } catch {
    // Ignore missing effects rather than letting one bad effect stop the weather loop.
  }
}

function spawnAround(player, particle, count, radius, yOffset = 1) {
  for (let i = 0; i < count; i += 1) {
    safeParticle(player, particle, {
      x: player.location.x + (Math.random() - 0.5) * radius,
      y: player.location.y + yOffset + Math.random() * 3,
      z: player.location.z + (Math.random() - 0.5) * radius
    });
  }
}

function strikeNear(player) {
  const x = Math.floor(player.location.x + (Math.random() - 0.5) * 24);
  const y = Math.floor(player.location.y);
  const z = Math.floor(player.location.z + (Math.random() - 0.5) * 24);
  runCommand(`summon lightning_bolt ${x} ${y} ${z}`);
}

function applyMode(mode) {
  syncVanillaWeather(mode);

  for (const player of allPlayers()) {
    switch (mode) {
      case "acid_rain":
        spawnAround(player, "minecraft:basic_flame_particle", 5, 12, 4);
        safeEffect(player, "poison", 60);
        break;
      case "thunderstorm":
        spawnAround(player, "minecraft:electric_spark_particle", 8, 18, 2);
        if (Math.random() < 0.25) strikeNear(player);
        break;
      case "blizzard":
        spawnAround(player, "minecraft:snowflake_particle", 20, 18, 2);
        safeEffect(player, "slowness", 80);
        break;
      case "sandstorm":
        spawnAround(player, "minecraft:falling_dust_top_snow_particle", 18, 16, 1);
        safeEffect(player, "blindness", 50);
        break;
      case "meteor_shower":
        spawnAround(player, "minecraft:lava_particle", 10, 22, 8);
        if (Math.random() < 0.20) strikeNear(player);
        break;
      case "blood_moon":
        spawnAround(player, "minecraft:crop_growth_emitter", 8, 20, 1);
        safeEffect(player, "strength", 80);
        break;
      case "clear":
        spawnAround(player, "minecraft:basic_smoke_particle", 1, 6, 2);
        break;
      default:
        spawnAround(player, "minecraft:basic_smoke_particle", 2, 10, 2);
        break;
    }
  }
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack?.typeId !== REMOTE_ID) return;
  system.run(() => nextMode(event.source));
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;

  system.run(() => {
    const player = event.player;
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return;

    const hasRemote = Array.from({ length: inventory.size }, (_, slot) => inventory.getItem(slot)?.typeId).includes(REMOTE_ID);
    if (!hasRemote) inventory.addItem(new ItemStack(REMOTE_ID, 1));

    player.onScreenDisplay.setTitle("§l§bInsane Weather Enabled", { subtitle: "Use the Weather Remote to cycle storms" });
    player.onScreenDisplay.setActionBar(`Version ${VERSION}: sneak-use to cycle backward`);
  });
});

system.runInterval(() => {
  const players = allPlayers();
  const stored = getStoredMode();
  const mode = stored === "dependent" && players.length > 0 ? getDependentMode(players[0]) : stored;
  applyMode(mode);
}, 40);
