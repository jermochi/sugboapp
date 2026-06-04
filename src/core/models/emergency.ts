/**
 * Emergency / hotline data schemas — matches assets/data/hotlines.json
 */

export interface Contact {
  name: string;
  number: string;
  label?: string;
}

export interface HotlineCategory {
  id: string;
  name: string;
  contacts: Contact[];
}

export interface HotlineData {
  primary?: Contact;
  categories: HotlineCategory[];
}
