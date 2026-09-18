/**
 * Event details, in one place: the invitation page shows them, and the
 * downloadable pass image is drawn from them.
 */
export const EVENT = {
  brand: "ChiNet Link",
  title: "ChiNet Launch",
  badge: "Launch Day · 19 September 2026",
  tagline: "You're invited to experience what's next in logistics.",

  /**
   * Banner at the top of the registration page. Some printed passes went out
   * with 11:00 PM on them; this is the correction guests see when they scan.
   * Set to null once the passes are no longer in circulation.
   */
  notice: {
    lead: "Starts 5:00 PM",
    text: "Some printed passes show 11:00 PM in error.",
  },

  /** short forms for the invitation's date/time/venue strip */
  dayShort: "Sat, Sep 19",
  year: "2026",
  time: "5:00 PM",
  venue: "Science Museum",
  city: "Addis Ababa",

  /** long forms for the saved pass image */
  dateLong: "Saturday, 19 September 2026",
  venueLong: "Science Museum, Addis Ababa",

  /** Ethiopian Science Museum, Addis Ababa (9.0214518, 38.7624086) */
  mapUrl: "https://maps.app.goo.gl/1uPKfZMXKpbJU6yy7",
};
