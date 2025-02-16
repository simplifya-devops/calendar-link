"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ics = exports.yahoo = exports.office365 = exports.outlook = exports.google = exports.eventify = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const query_string_1 = require("query-string");
const utils_1 = require("./utils");
dayjs_1.default.extend(utc_1.default);
function formatTimes({ allDay, startUtc, endUtc }, dateTimeFormat) {
    const format = utils_1.TimeFormats[allDay ? "allDay" : dateTimeFormat];
    return { start: startUtc.format(format), end: endUtc.format(format) };
}
exports.eventify = (event) => {
    const { start, end, duration, ...rest } = event;
    const startUtc = dayjs_1.default(start).utc();
    const endUtc = end
        ? dayjs_1.default(end).utc()
        : (() => {
            if (event.allDay) {
                return startUtc.add(1, "day");
            }
            if (duration && duration.length == 2) {
                const value = Number(duration[0]);
                const unit = duration[1];
                return startUtc.add(value, unit);
            }
            return dayjs_1.default().utc();
        })();
    return {
        ...rest,
        startUtc,
        endUtc,
    };
};
exports.google = (calendarEvent) => {
    const event = exports.eventify(calendarEvent);
    const { start, end } = formatTimes(event, "dateTimeUTC");
    const details = {
        action: "TEMPLATE",
        text: event.title,
        details: event.description,
        location: event.location,
        trp: event.busy,
        dates: start + "/" + end,
    };
    if (event.guests && event.guests.length) {
        details.add = event.guests.join();
    }
    return `https://calendar.google.com/calendar/render?${query_string_1.stringify(details)}`;
};
exports.outlook = (calendarEvent) => {
    const event = exports.eventify(calendarEvent);
    const { start, end } = formatTimes(event, "dateTimeUTC");
    const details = {
        path: "/calendar/action/compose",
        rru: "addevent",
        startdt: start,
        enddt: end,
        subject: event.title,
        body: event.description,
        location: event.location,
    };
    return `https://outlook.live.com/calendar/0/deeplink/compose?${query_string_1.stringify(details)}`.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/g, "$1-$2-$3T$4:$5:$6");
};
exports.office365 = (calendarEvent) => {
    const event = exports.eventify(calendarEvent);
    const { start, end } = formatTimes(event, "dateTime");
    const details = {
        path: "/calendar/action/compose",
        rru: "addevent",
        startdt: start,
        enddt: end,
        subject: event.title,
        body: event.description,
        location: event.location,
    };
    return `https://outlook.office.com/calendar/0/deeplink/compose?${query_string_1.stringify(details)}`.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/g, "$1-$2-$3T$4:$5:$6");
};
exports.yahoo = (calendarEvent) => {
    const event = exports.eventify(calendarEvent);
    const { start, end } = formatTimes(event, "dateTimeUTC");
    const details = {
        v: 60,
        title: event.title,
        st: start,
        et: end,
        desc: event.description,
        in_loc: event.location,
    };
    return `https://calendar.yahoo.com/?${query_string_1.stringify(details)}`;
};
exports.ics = (calendarEvent) => {
    const event = exports.eventify(calendarEvent);
    const formattedDescription = (event.description || "")
        .replace(/,/gm, ",")
        .replace(/;/gm, ";")
        .replace(/\n/gm, "\\n")
        .replace(/(\\n)[\s\t]+/gm, "\\n");
    const formattedLocation = (event.location || "")
        .replace(/,/gm, ",")
        .replace(/;/gm, ";")
        .replace(/\n/gm, "\\n")
        .replace(/(\\n)[\s\t]+/gm, "\\n");
    const { start, end } = formatTimes(event, "dateTimeUTC");
    const calendarChunks = [
        {
            key: "BEGIN",
            value: "VCALENDAR",
        },
        {
            key: "VERSION",
            value: "2.0",
        },
        {
            key: "BEGIN",
            value: "VEVENT",
        },
        {
            key: "URL",
            value: event.url,
        },
        {
            key: "DTSTART",
            value: start,
        },
        {
            key: "DTEND",
            value: end,
        },
        {
            key: "SUMMARY",
            value: event.title,
        },
        {
            key: "DESCRIPTION",
            value: formattedDescription,
        },
        {
            key: "LOCATION",
            value: formattedLocation,
        },
        {
            key: "END",
            value: "VEVENT",
        },
        {
            key: "END",
            value: "VCALENDAR",
        },
    ];
    let calendarUrl = "";
    calendarChunks.forEach((chunk) => {
        if (chunk.value) {
            calendarUrl += `${chunk.key}:${encodeURIComponent(`${chunk.value}\n`)}`;
        }
    });
    return `data:text/calendar;charset=utf8,${calendarUrl}`;
};
//# sourceMappingURL=index.js.map