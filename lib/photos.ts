// Slicing the album into month sections.
//
// `taken_on` is a Postgres `date`, which arrives as the plain string
// "2025-04-26". Never hand that to `new Date()`: a bare date string parses as
// UTC midnight, so anywhere west of Greenwich the 1st of a month reads back as
// the last day of the previous one and the photo lands in the wrong section.
// Reading the year and month straight off the string sidesteps the whole
// timezone question -- the date the uploader saw is the date we group by.
const YMD = /^(\d{4})-(\d{2})-\d{2}/;
const UNDATED = "undated";

export type PhotoGroup<T> = {
    key: string; // "2025-04", or "undated" -- stable enough for a React key
    label: string;
    photos: T[];
};

/** The section a photo belongs to. Anything unparseable counts as undated. */
export const monthOf = (takenOn: string | null): { key: string; label: string } => {
    const match = takenOn ? YMD.exec(takenOn) : null;
    if (!match) return { key: UNDATED, label: "Hong nhớ hồi nào" };
    const [, year, month] = match;
    return { key: `${year}-${month}`, label: `Tháng ${Number(month)}, ${year}` };
};

/**
 * Group photos into month sections, keeping the order they came in -- the query
 * already sorts newest first, and a Map preserves insertion order, so the
 * sections come out newest first too. Undated photos always trail the dated
 * ones, whatever order they arrived in.
 */
export function groupByMonth<T extends { taken_on: string | null }>(
    photos: readonly T[],
): PhotoGroup<T>[] {
    const groups = new Map<string, PhotoGroup<T>>();

    for (const photo of photos) {
        const { key, label } = monthOf(photo.taken_on);
        const group = groups.get(key) ?? { key, label, photos: [] };
        group.photos.push(photo);
        groups.set(key, group);
    }

    const undated = groups.get(UNDATED);
    if (undated) groups.delete(UNDATED);
    return [...groups.values(), ...(undated ? [undated] : [])];
}

/**
 * The calendar date a timestamp fell on where the uploader is standing, shaped
 * for the `taken_on` column. `toISOString().slice(0, 10)` answers in UTC, which
 * in Vietnam files every photo taken before 7am under the day before -- and at
 * the turn of a month, under the wrong section entirely.
 */
export const localDate = (ms: number): string => {
    const taken = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${taken.getFullYear()}-${pad(taken.getMonth() + 1)}-${pad(taken.getDate())}`;
};
