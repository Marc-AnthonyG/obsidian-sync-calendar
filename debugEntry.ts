import moment from "moment";
import type { App } from "obsidian";
import { GoogleCalendarSync } from "src/sync/google-calendar/GoogleCalendarSync";


const app: App = {vault: {}} as App;

const googleCalendarSync = new GoogleCalendarSync(app);

googleCalendarSync.listEvents(moment("2025-06-06"))