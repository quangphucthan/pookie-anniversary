// Whole days elapsed between two dates, counted in local calendar days.
// Both operands are normalised to local midnight, so the gap is always a whole
// number of days +/- one hour on DST days -- round, not floor, or every
// spring-forward silently eats a day.
export const daysSince = (from: Date, to: Date): number =>
    Math.round(
        (new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime() -
            new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) /
            86_400_000,
    );
