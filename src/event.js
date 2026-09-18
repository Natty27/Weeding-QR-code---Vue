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
   * Banner at the top of the registration page. The printed passes give the
   * start time in Ethiopian reckoning (11:00), which is 5:00 PM on the
   * international clock shown elsewhere on the page - the same moment, not a
   * mistake. Set to null to remove the banner.
   */
  notice: "The event starts at 11:00 Ethiopian time",

  /** short forms for the invitation's date/time/venue strip */
  dayShort: "Sat, Sep 19",
  year: "2026",
  time: "5:00 PM",
  venue: "Science Museum",
  city: "Addis Ababa",

  /** long forms for the saved pass and invitation images */
  dateLong: "Saturday, 19 September 2026",
  /** both clocks, because the printed invitations give the Ethiopian one */
  timeBoth: "11:00 Ethiopian time  ·  5:00 PM",
  venueLong: "Science Museum, Addis Ababa",

  /** Ethiopian Science Museum, Addis Ababa (9.0214518, 38.7624086) */
  mapUrl: "https://maps.app.goo.gl/1uPKfZMXKpbJU6yy7",
};
