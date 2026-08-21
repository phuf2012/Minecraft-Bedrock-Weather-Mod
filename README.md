# Minecraft Bedrock Insane Weather Mod

Version 1.0.0 is a complete Bedrock add-on for Minecraft Bedrock 1.26.40-style worlds. It adds an extreme, script-driven weather system, storm visuals, and a craftable/auto-granted Weather Remote.

## Packs

- `behavior_packs/InsaneWeatherBP` contains the gameplay logic, custom item, recipe, and weather script.
- `resource_packs/InsaneWeatherRP` contains the Weather Remote texture and storm fog resource definitions.

## Release downloads

The first release is stored in `releases/v1.0.0`:

- `InsaneWeatherBP-v1.0.0.mcpack`
- `InsaneWeatherRP-v1.0.0.mcpack`

Codex PR creation does not support binary files, so release packs are generated instead of stored directly in git. On GitHub, the included workflow uploads both `.mcpack` files as the `InsaneWeather-v1.0.0-mcpacks` artifact. Locally, run `python3 tools/build_release.py` to recreate both files in `releases/v1.0.0`.

## Weather Remote

The Weather Remote item is registered as `insane_weather:weather_remote`. Players receive one automatically on first spawn, and it can also be crafted at a crafting table with redstone, gold, a clock, a lightning rod, and a nether star.

Use the remote to cycle forward through weather modes. Sneak while using it to cycle backward.

## Weather modes

- `dependent`: chooses intense weather dynamically from world time and player height.
- `clear`: forces clear weather.
- `acid_rain`: rain with poison pressure and flame-like storm particles.
- `thunderstorm`: thunder weather with electric particles and nearby lightning strikes.
- `blizzard`: rain weather plus snow particles and slowness for whiteout conditions.
- `sandstorm`: dust-like particles and blindness for low-visibility storms.
- `meteor_shower`: thunder weather, lava particles, and randomized lightning impacts.
- `blood_moon`: nighttime rain ambience with red growth particles and a strength effect.

## Install from source folders

1. Run `python3 tools/build_release.py` if you need local `.mcpack` files.
2. Copy `behavior_packs/InsaneWeatherBP` into your Bedrock `behavior_packs` folder.
3. Copy `resource_packs/InsaneWeatherRP` into your Bedrock `resource_packs` folder.
4. Enable both packs on a world.
5. Enable Beta APIs/Script APIs if your Bedrock build requires them for JavaScript add-ons.

## Notes

The script uses vanilla commands, particles, effects, and weather states so the addon remains portable and easy to tune. The dynamic `dependent` mode intentionally reacts to time of day and player elevation rather than staying on a single fixed storm.
