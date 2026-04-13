import { editorialWarm } from "./editorial-warm.js";
import { nightSignal } from "./night-signal.js";
import { studioDefault } from "./studio-default.js";

export const presets = [studioDefault, editorialWarm, nightSignal];
export const presetsById = new Map(presets.map((preset) => [preset.id, preset]));
