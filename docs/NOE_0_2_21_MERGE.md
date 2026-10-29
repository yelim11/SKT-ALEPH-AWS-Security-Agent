# Noe private branch + ALEPH 0.2.21

This is a **separate local test copy**, not a modification to the certified main branch.

Latest provided 0.2.21 startup, native login preparation and official PC-status API are retained. The old student UI and sprite atlas are copied locally; the old local-PC API is replaced with official /api/pc/status. The official API supplies aggregate Windows events, **not** log-specific counts: the comparison chart shows verified aggregate error/warning bars and does not fake per-log counts. The original consent workflow is preserved and the single guided button delegates to it. No credentials or personal native host files are copied.

Start from the new project directory, with NO -Demo: powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1

Manual Windows/AI approval remains necessary; runtime validation against the real Windows native host and browser is pending.
