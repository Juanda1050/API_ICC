import { RoleDictionary } from "../types/coordinator.types";

export const roles: RoleDictionary = {
  coordinator_general: {
    id: "f5099ae7-f36d-4439-82fa-0df8915d6678",
    name: "coordinator",
  },
  coordinator: {
    id: "128eed0c-fb9e-478c-8f41-2df6dfc9cb1d",
    name: "coordinator",
  },
  user: {
    id: "5234a757-7412-498d-9171-d559d09ed20a",
    name: "user",
  },
  admin: {
    id: "f497bb9e-1315-4375-847d-d5cb980dcd78",
    name: "admin",
  },
};

export const ALLOWED_SORT_FIELDS_EVENTS = [
  "created_at",
  "event_date",
  "name",
  "place",
  "spent",
  "total_amount",
  "profit",
];

export const ALLOWED_SORT_FIELDS_CONTRIBUTIONS = ["created_at", "updated_at"];
