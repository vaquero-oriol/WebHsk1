/* ===== Localized pricing =====
   Replaces the amounts marked with [data-price] with the real App Store
   price for the visitor's country. Country detection is local only (browser
   timezone, then browser language region); no external requests, no cookies.
   If the country cannot be detected or has no entry, the static price of the
   page stays as the fallback. Prices mirror the App Store Connect price list. */
(function () {
  'use strict';

  /* [currency, lifetime, monthly, countries] */
  const GROUPS = [
    ['EUR', 4.99, 2.99, 'AT BA BE BG CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT RS SI SK XK'],
    ['EUR', 3.99, 1.99, 'ME'],
    ['USD', 3.99, 2.99, 'AF AG AI AO BF BH BM BN BO BS BT BW BZ CD CG CR CV DM DO DZ EC FJ FM GA GD GM GT GW GY HN IQ JM JO KG KH KN KW KY LA LB LC LK LR LY MA MG MK ML MM MN MO MR MS MV MW MZ NA NE NI NR OM PA PG PW PY RW SB SC SL SR ST SV SZ TC TD TJ TM TN TO TT UY UZ VC VE VG VU YE'],
    ['USD', 4.99, 3.99, 'AL AM AZ BB BJ BY CI CM GE GH IS KE MD MU NP SN UA UG ZM ZW'],
    ['USD', 4.99, 2.99, 'AR US'],
    ['AED', 14.99, 12.99, 'AE'],
    ['AUD', 5.99, 4.99, 'AU'],
    ['BRL', 24.9, 19.9, 'BR'],
    ['CAD', 4.99, 3.99, 'CA'],
    ['CHF', 3, 3, 'CH'],
    ['CLP', 4990, 2990, 'CL'],
    ['CNY', 28, 22, 'CN'],
    ['COP', 19900, 14900, 'CO'],
    ['CZK', 99, 79, 'CZ'],
    ['DKK', 39, 29, 'DK'],
    ['EGP', 199.99, 149.99, 'EG'],
    ['GBP', 3.99, 2.99, 'GB'],
    ['HKD', 32, 22, 'HK'],
    ['HUF', 1790, 1490, 'HU'],
    ['IDR', 69000, 49000, 'ID'],
    ['ILS', 19.99, 9.9, 'IL'],
    ['INR', 399, 299, 'IN'],
    ['JPY', 600, 500, 'JP'],
    ['KRW', 6600, 4400, 'KR'],
    ['KZT', 2490, 1790, 'KZ'],
    ['MXN', 89, 69, 'MX'],
    ['MYR', 19.9, 14.9, 'MY'],
    ['NGN', 6900, 4900, 'NG'],
    ['NOK', 49, 39, 'NO'],
    ['NZD', 6.99, 4.99, 'NZ'],
    ['PEN', 17.9, 12.9, 'PE'],
    ['PHP', 249, 199, 'PH'],
    ['PKR', 1100, 900, 'PK'],
    ['PLN', 19.99, 14.99, 'PL'],
    ['QAR', 14.99, 9.99, 'QA'],
    ['RON', 19.99, 14.99, 'RO'],
    ['RUB', 349, 249, 'RU'],
    ['SAR', 17.99, 12.99, 'SA'],
    ['SEK', 49, 39, 'SE'],
    ['SGD', 5.98, 3.98, 'SG'],
    ['THB', 149, 99, 'TH'],
    ['TRY', 199.99, 149.99, 'TR'],
    ['TWD', 120, 90, 'TW'],
    ['TZS', 11900, 9900, 'TZ'],
    ['VND', 119000, 99000, 'VN'],
    ['ZAR', 79.99, 59.99, 'ZA'],
  ];

  const PRICES = {};
  GROUPS.forEach(function (g) {
    g[3].split(' ').forEach(function (cc) {
      PRICES[cc] = { cur: g[0], life: g[1], month: g[2] };
    });
  });

  /* IANA timezone -> ISO 3166 country, for the countries priced above
     (generated from the tz database, plus backward-compatible aliases). */
  const TZ_COUNTRY = {
    "Africa/Abidjan":"CI","Africa/Accra":"GH","Africa/Algiers":"DZ","Africa/Asmara":"ER",
    "Africa/Asmera":"ER","Africa/Bamako":"ML","Africa/Bangui":"CF","Africa/Banjul":"GM",
    "Africa/Bissau":"GW","Africa/Brazzaville":"CG","Africa/Cairo":"EG","Africa/Casablanca":"MA",
    "Africa/Ceuta":"ES","Africa/Conakry":"GN","Africa/Dakar":"SN","Africa/Dar_es_Salaam":"TZ",
    "Africa/Djibouti":"DJ","Africa/Douala":"CM","Africa/Freetown":"SL","Africa/Gaborone":"BW",
    "Africa/Harare":"ZW","Africa/Johannesburg":"ZA","Africa/Kampala":"UG","Africa/Kigali":"RW",
    "Africa/Kinshasa":"CD","Africa/Lagos":"NG","Africa/Libreville":"GA","Africa/Lome":"TG",
    "Africa/Luanda":"AO","Africa/Lubumbashi":"CD","Africa/Lusaka":"ZM","Africa/Maputo":"MZ",
    "Africa/Mogadishu":"SO","Africa/Monrovia":"LR","Africa/Nairobi":"KE","Africa/Ndjamena":"TD",
    "Africa/Niamey":"NE","Africa/Ouagadougou":"BF","Africa/Porto-Novo":"BJ","Africa/Tripoli":"LY",
    "Africa/Tunis":"TN","Africa/Windhoek":"NA","America/Adak":"US","America/Anchorage":"US",
    "America/Antigua":"AG","America/Araguaina":"BR","America/Argentina/Buenos_Aires":"AR",
    "America/Argentina/Catamarca":"AR","America/Argentina/Cordoba":"AR","America/Argentina/Jujuy":"AR",
    "America/Argentina/La_Rioja":"AR","America/Argentina/Mendoza":"AR",
    "America/Argentina/Rio_Gallegos":"AR","America/Argentina/Salta":"AR",
    "America/Argentina/San_Juan":"AR","America/Argentina/San_Luis":"AR",
    "America/Argentina/Tucuman":"AR","America/Argentina/Ushuaia":"AR","America/Aruba":"AW",
    "America/Asuncion":"PY","America/Atikokan":"CA","America/Bahia":"BR","America/Bahia_Banderas":"MX",
    "America/Belem":"BR","America/Belize":"BZ","America/Blanc-Sablon":"CA","America/Boa_Vista":"BR",
    "America/Bogota":"CO","America/Boise":"US","America/Buenos_Aires":"AR","America/Cambridge_Bay":"CA",
    "America/Campo_Grande":"BR","America/Cancun":"MX","America/Caracas":"VE","America/Catamarca":"AR",
    "America/Cayman":"KY","America/Chicago":"US","America/Chihuahua":"MX","America/Ciudad_Juarez":"MX",
    "America/Cordoba":"AR","America/Costa_Rica":"CR","America/Coyhaique":"CL","America/Creston":"CA",
    "America/Cuiaba":"BR","America/Dawson":"CA","America/Dawson_Creek":"CA","America/Denver":"US",
    "America/Detroit":"US","America/Dominica":"DM","America/Edmonton":"CA","America/Eirunepe":"BR",
    "America/El_Salvador":"SV","America/Ensenada":"MX","America/Fort_Nelson":"CA",
    "America/Fortaleza":"BR","America/Glace_Bay":"CA","America/Goose_Bay":"CA",
    "America/Grand_Turk":"TC","America/Grenada":"GD","America/Guatemala":"GT","America/Guayaquil":"EC",
    "America/Halifax":"CA","America/Hermosillo":"MX","America/Indiana/Indianapolis":"US",
    "America/Indiana/Knox":"US","America/Indiana/Marengo":"US","America/Indiana/Petersburg":"US",
    "America/Indiana/Tell_City":"US","America/Indiana/Vevay":"US","America/Indiana/Vincennes":"US",
    "America/Indiana/Winamac":"US","America/Inuvik":"CA","America/Iqaluit":"CA","America/Jamaica":"JM",
    "America/Jujuy":"AR","America/Juneau":"US","America/Kentucky/Louisville":"US",
    "America/Kentucky/Monticello":"US","America/La_Paz":"BO","America/Lima":"PE",
    "America/Los_Angeles":"US","America/Maceio":"BR","America/Managua":"NI","America/Manaus":"BR",
    "America/Matamoros":"MX","America/Mazatlan":"MX","America/Mendoza":"AR","America/Menominee":"US",
    "America/Merida":"MX","America/Metlakatla":"US","America/Mexico_City":"MX","America/Moncton":"CA",
    "America/Monterrey":"MX","America/Montevideo":"UY","America/Nassau":"BS","America/New_York":"US",
    "America/Nome":"US","America/Noronha":"BR","America/North_Dakota/Beulah":"US",
    "America/North_Dakota/Center":"US","America/North_Dakota/New_Salem":"US","America/Ojinaga":"MX",
    "America/Panama":"PA","America/Paramaribo":"SR","America/Phoenix":"US",
    "America/Port-au-Prince":"HT","America/Port_of_Spain":"TT","America/Porto_Acre":"BR",
    "America/Porto_Velho":"BR","America/Punta_Arenas":"CL","America/Rankin_Inlet":"CA",
    "America/Recife":"BR","America/Regina":"CA","America/Resolute":"CA","America/Rio_Branco":"BR",
    "America/Rosario":"AR","America/Santa_Isabel":"MX","America/Santarem":"BR","America/Santiago":"CL",
    "America/Santo_Domingo":"DO","America/Sao_Paulo":"BR","America/Sitka":"US","America/St_Johns":"CA",
    "America/St_Kitts":"KN","America/St_Lucia":"LC","America/Swift_Current":"CA",
    "America/Tegucigalpa":"HN","America/Tijuana":"MX","America/Toronto":"CA","America/Tortola":"VG",
    "America/Vancouver":"CA","America/Whitehorse":"CA","America/Winnipeg":"CA","America/Yakutat":"US",
    "Antarctica/Macquarie":"AU","Asia/Aden":"YE","Asia/Almaty":"KZ","Asia/Amman":"JO",
    "Asia/Anadyr":"RU","Asia/Aqtau":"KZ","Asia/Aqtobe":"KZ","Asia/Ashgabat":"TM","Asia/Ashkhabad":"TM",
    "Asia/Atyrau":"KZ","Asia/Baghdad":"IQ","Asia/Bahrain":"BH","Asia/Baku":"AZ","Asia/Bangkok":"TH",
    "Asia/Barnaul":"RU","Asia/Beirut":"LB","Asia/Bishkek":"KG","Asia/Calcutta":"IN","Asia/Chita":"RU",
    "Asia/Colombo":"LK","Asia/Dacca":"BD","Asia/Dhaka":"BD","Asia/Dubai":"AE","Asia/Dushanbe":"TJ",
    "Asia/Famagusta":"CY","Asia/Ho_Chi_Minh":"VN","Asia/Hong_Kong":"HK","Asia/Hovd":"MN",
    "Asia/Irkutsk":"RU","Asia/Istanbul":"TR","Asia/Jakarta":"ID","Asia/Jayapura":"ID",
    "Asia/Jerusalem":"IL","Asia/Kamchatka":"RU","Asia/Karachi":"PK","Asia/Kathmandu":"NP",
    "Asia/Katmandu":"NP","Asia/Khandyga":"RU","Asia/Kolkata":"IN","Asia/Krasnoyarsk":"RU",
    "Asia/Kuala_Lumpur":"MY","Asia/Kuching":"MY","Asia/Kuwait":"KW","Asia/Macau":"MO",
    "Asia/Magadan":"RU","Asia/Makassar":"ID","Asia/Manila":"PH","Asia/Muscat":"OM","Asia/Nicosia":"CY",
    "Asia/Novokuznetsk":"RU","Asia/Novosibirsk":"RU","Asia/Omsk":"RU","Asia/Oral":"KZ",
    "Asia/Phnom_Penh":"KH","Asia/Pontianak":"ID","Asia/Qatar":"QA","Asia/Qostanay":"KZ",
    "Asia/Qyzylorda":"KZ","Asia/Rangoon":"MM","Asia/Riyadh":"SA","Asia/Saigon":"VN",
    "Asia/Sakhalin":"RU","Asia/Samarkand":"UZ","Asia/Seoul":"KR","Asia/Singapore":"SG",
    "Asia/Srednekolymsk":"RU","Asia/Taipei":"TW","Asia/Tashkent":"UZ","Asia/Tbilisi":"GE",
    "Asia/Tokyo":"JP","Asia/Tomsk":"RU","Asia/Ujung_Pandang":"ID","Asia/Ulaanbaatar":"MN",
    "Asia/Ulan_Bator":"MN","Asia/Ust-Nera":"RU","Asia/Vientiane":"LA","Asia/Vladivostok":"RU",
    "Asia/Yakutsk":"RU","Asia/Yangon":"MM","Asia/Yekaterinburg":"RU","Asia/Yerevan":"AM",
    "Atlantic/Azores":"PT","Atlantic/Bermuda":"BM","Atlantic/Canary":"ES","Atlantic/Cape_Verde":"CV",
    "Atlantic/Madeira":"PT","Atlantic/Reykjavik":"IS","Australia/ACT":"AU","Australia/Adelaide":"AU",
    "Australia/Brisbane":"AU","Australia/Broken_Hill":"AU","Australia/Darwin":"AU",
    "Australia/Eucla":"AU","Australia/Hobart":"AU","Australia/Lindeman":"AU","Australia/Lord_Howe":"AU",
    "Australia/Melbourne":"AU","Australia/NSW":"AU","Australia/North":"AU","Australia/Perth":"AU",
    "Australia/Queensland":"AU","Australia/South":"AU","Australia/Sydney":"AU",
    "Australia/Tasmania":"AU","Australia/Victoria":"AU","Australia/West":"AU","Brazil/East":"BR",
    "Brazil/West":"BR","Canada/Atlantic":"CA","Canada/Central":"CA","Canada/Eastern":"CA",
    "Canada/Mountain":"CA","Canada/Newfoundland":"CA","Canada/Pacific":"CA","Egypt":"EG","Eire":"IE",
    "Europe/Amsterdam":"NL","Europe/Astrakhan":"RU","Europe/Athens":"GR","Europe/Belgrade":"RS",
    "Europe/Berlin":"DE","Europe/Bratislava":"SK","Europe/Brussels":"BE","Europe/Bucharest":"RO",
    "Europe/Budapest":"HU","Europe/Busingen":"DE","Europe/Chisinau":"MD","Europe/Copenhagen":"DK",
    "Europe/Dublin":"IE","Europe/Gibraltar":"GI","Europe/Helsinki":"FI","Europe/Istanbul":"TR",
    "Europe/Kaliningrad":"RU","Europe/Kiev":"UA","Europe/Kirov":"RU","Europe/Kyiv":"UA",
    "Europe/Lisbon":"PT","Europe/Ljubljana":"SI","Europe/London":"GB","Europe/Luxembourg":"LU",
    "Europe/Madrid":"ES","Europe/Malta":"MT","Europe/Minsk":"BY","Europe/Monaco":"MC",
    "Europe/Moscow":"RU","Europe/Nicosia":"CY","Europe/Oslo":"NO","Europe/Paris":"FR",
    "Europe/Prague":"CZ","Europe/Riga":"LV","Europe/Rome":"IT","Europe/Samara":"RU",
    "Europe/San_Marino":"SM","Europe/Sarajevo":"BA","Europe/Saratov":"RU","Europe/Simferopol":"UA",
    "Europe/Skopje":"MK","Europe/Sofia":"BG","Europe/Stockholm":"SE","Europe/Tallinn":"EE",
    "Europe/Tirane":"AL","Europe/Ulyanovsk":"RU","Europe/Vaduz":"LI","Europe/Vatican":"VA",
    "Europe/Vienna":"AT","Europe/Vilnius":"LT","Europe/Volgograd":"RU","Europe/Warsaw":"PL",
    "Europe/Zagreb":"HR","Europe/Zurich":"CH","GB":"GB","GB-Eire":"GB","Hongkong":"HK",
    "Indian/Comoro":"KM","Indian/Mahe":"SC","Indian/Maldives":"MV","Indian/Mauritius":"MU",
    "Israel":"IL","Japan":"JP","Mexico/BajaNorte":"MX","Mexico/BajaSur":"MX","Mexico/General":"MX",
    "NZ":"NZ","Pacific/Apia":"WS","Pacific/Auckland":"NZ","Pacific/Bougainville":"PG",
    "Pacific/Chatham":"NZ","Pacific/Chuuk":"FM","Pacific/Easter":"CL","Pacific/Efate":"VU",
    "Pacific/Fiji":"FJ","Pacific/Galapagos":"EC","Pacific/Guadalcanal":"SB","Pacific/Honolulu":"US",
    "Pacific/Kosrae":"FM","Pacific/Pohnpei":"FM","Pacific/Port_Moresby":"PG","Pacific/Tongatapu":"TO",
    "Poland":"PL","Portugal":"PT","ROK":"KR","Singapore":"SG","Turkey":"TR","US/Alaska":"US",
    "US/Arizona":"US","US/Central":"US","US/Eastern":"US","US/Hawaii":"US","US/Mountain":"US",
    "US/Pacific":"US","W-SU":"RU","America/Montreal":"CA","America/Indianapolis":"US",
    "America/Louisville":"US","America/Knox_IN":"US","America/Shiprock":"US","Europe/Belfast":"GB",
    "Asia/Tel_Aviv":"IL","Africa/Timbuktu":"ML","Pacific/Ponape":"FM","Pacific/Truk":"FM"
  };

  function detectCountry() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
    } catch (e) { /* fall through to language */ }
    const langs = navigator.languages || [navigator.language];
    for (let i = 0; i < langs.length; i++) {
      const m = /-([A-Za-z]{2})(?:-|$)/.exec(langs[i] || '');
      if (m) return m[1].toUpperCase();
    }
    return null;
  }

  function formatPrice(amount, currency, locale) {
    const opts = { style: 'currency', currency: currency };
    if (amount === 0 || (Number.isInteger(amount) && amount >= 100)) {
      opts.minimumFractionDigits = 0;
      opts.maximumFractionDigits = 0;
    }
    return new Intl.NumberFormat(locale, opts).format(amount);
  }

  function apply() {
    const country = detectCountry();
    const p = country && PRICES[country];
    if (!p) return; // unknown country: keep the page's static prices
    const locale = document.documentElement.lang || 'en';
    document.querySelectorAll('[data-price]').forEach(function (el) {
      const kind = el.getAttribute('data-price');
      const amount = kind === 'free' ? 0 : (kind === 'life' ? p.life : p.month);
      try {
        el.textContent = formatPrice(amount, p.cur, locale);
      } catch (e) { /* keep static fallback on any Intl failure */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
