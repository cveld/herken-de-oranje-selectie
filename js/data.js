/*
 * Selectie van het Nederlands elftal (Oranje).
 *
 * ⚠️ STARTDATASET — CONTROLEER & PAS AAN.
 * Namen, rugnummers en clubs zijn een redelijke startset maar moeten
 * geverifieerd worden. Aanpassen kan gewoon hieronder.
 *
 * Velden:
 *   id       uniek, stabiel (gebruikt voor de avatar-generatie)
 *   name     volledige weergavenaam
 *   number   rugnummer
 *   position 'Keeper' | 'Verdediger' | 'Middenvelder' | 'Aanvaller'
 *   club     huidige club (flavor, mag leeg)
 *   image    OPTIONEEL pad naar een (gelicenseerde!) foto; leeg = avatar
 */
window.PLAYERS = [
  { id: "verbruggen",  name: "Bart Verbruggen",   number: 1,  position: "Keeper",       club: "Brighton" },
  { id: "geertruida",  name: "Lutsharel Geertruida", number: 2, position: "Verdediger",  club: "RB Leipzig" },
  { id: "deligt",      name: "Matthijs de Ligt",  number: 3,  position: "Verdediger",    club: "Man United" },
  { id: "vandijk",     name: "Virgil van Dijk",   number: 4,  position: "Verdediger",    club: "Liverpool" },
  { id: "ake",         name: "Nathan Aké",        number: 5,  position: "Verdediger",    club: "Man City" },
  { id: "deroon",      name: "Marten de Roon",    number: 6,  position: "Middenvelder",  club: "Atalanta" },
  { id: "malen",       name: "Donyell Malen",     number: 7,  position: "Aanvaller",     club: "Aston Villa" },
  { id: "koopmeiners", name: "Teun Koopmeiners",  number: 8,  position: "Middenvelder",  club: "Juventus" },
  { id: "weghorst",    name: "Wout Weghorst",     number: 9,  position: "Aanvaller",     club: "Ajax" },
  { id: "depay",       name: "Memphis Depay",     number: 10, position: "Aanvaller",     club: "Corinthians" },
  { id: "gakpo",       name: "Cody Gakpo",        number: 11, position: "Aanvaller",     club: "Liverpool" },
  { id: "flekken",     name: "Mark Flekken",      number: 12, position: "Keeper",        club: "Leeds" },
  { id: "bijlow",      name: "Justin Bijlow",     number: 13, position: "Keeper",        club: "Feyenoord" },
  { id: "reijnders",   name: "Tijjani Reijnders", number: 14, position: "Middenvelder",  club: "Man City" },
  { id: "devrij",      name: "Stefan de Vrij",    number: 15, position: "Verdediger",    club: "Inter" },
  { id: "schouten",    name: "Jerdy Schouten",    number: 16, position: "Middenvelder",  club: "PSV" },
  { id: "frimpong",    name: "Jeremie Frimpong",  number: 17, position: "Verdediger",    club: "Liverpool" },
  { id: "gravenberch", name: "Ryan Gravenberch",  number: 18, position: "Middenvelder",  club: "Liverpool" },
  { id: "brobbey",     name: "Brian Brobbey",     number: 19, position: "Aanvaller",     club: "Ajax" },
  { id: "veerman",     name: "Joey Veerman",      number: 20, position: "Middenvelder",  club: "PSV" },
  { id: "dejong",      name: "Frenkie de Jong",   number: 21, position: "Middenvelder",  club: "Barcelona" },
  { id: "dumfries",    name: "Denzel Dumfries",   number: 22, position: "Verdediger",    club: "Inter" },
  { id: "zirkzee",     name: "Joshua Zirkzee",    number: 23, position: "Aanvaller",     club: "Man United" },
  { id: "vandeven",    name: "Micky van de Ven",  number: 24, position: "Verdediger",    club: "Tottenham" },
  { id: "timber",      name: "Jurriën Timber",    number: 25, position: "Verdediger",    club: "Arsenal" },
  { id: "xavi",        name: "Xavi Simons",       number: 26, position: "Middenvelder",  club: "RB Leipzig" },
  { id: "bergwijn",    name: "Steven Bergwijn",   number: 27, position: "Aanvaller",     club: "Al-Ittihad" },
];
