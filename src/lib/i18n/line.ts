/** A line of display typography; `i` marks it as an italic serif accent. */
export type Line = { t: string; i: boolean };

export const line = (t: string, i = false): Line => ({ t, i });
