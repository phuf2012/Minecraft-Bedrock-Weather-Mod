# Insane Weather v1.0.0 Release

The downloadable `.mcpack` files are generated from source because Codex PR creation does not support binary files.

## Build locally

Run this from the repository root:

```bash
python3 tools/build_release.py
```

That creates:

- `InsaneWeatherBP-v1.0.0.mcpack` — behavior pack with the Weather Remote, recipe, and weather script.
- `InsaneWeatherRP-v1.0.0.mcpack` — resource pack with the Weather Remote texture and storm fog assets.

## Download from GitHub

After the PR is merged, open the latest **Build Bedrock Packs** workflow run and download the `InsaneWeather-v1.0.0-mcpacks` artifact. Enable both packs on the same world. If your Bedrock build gates JavaScript add-ons behind experiments, enable Beta APIs/Script APIs before loading the world.
